package handlers

import (
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// Helper to call the Service Layer (Clean Architecture).
// Secret comes from config.JWTSecret set once at startup (main.go).
func getAuthService() services.AuthService {
	repo := repository.NewUserRepository(config.DB)
	return services.NewAuthService(repo, config.JWTSecret)
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateProfileRequest struct {
	Name              string `json:"name"`
	VehicleType       string `json:"vehicle_type"`
	ServiceArea       string `json:"service_area"`
	BankName          string `json:"bank_name"`
	BankAccountNumber string `json:"bank_account_number"`
}

type RedeemKarmaRequest struct {
	AmountKarma int `json:"amount_karma"`
}

type RedeemEarningsRequest struct {
	AmountRupiah int64 `json:"amount_rupiah"`
}

// setAuthCookie writes the JWT into an httpOnly cookie so JavaScript cannot read it.
func setAuthCookie(c *fiber.Ctx, token string) {
	c.Cookie(&fiber.Cookie{
		Name:     "pilah_token",
		Value:    token,
		HTTPOnly: true,
		Secure:   os.Getenv("APP_ENV") == "production",
		SameSite: "Lax",
		Path:     "/",
		Expires:  time.Now().Add(72 * time.Hour),
	})
}

// clearAuthCookie removes the session cookie (used on logout).
// Attributes match setAuthCookie (Secure & SameSite) so the cleared cookie is
// identical to the one created at login.
func clearAuthCookie(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     "pilah_token",
		Value:    "",
		HTTPOnly: true,
		Secure:   os.Getenv("APP_ENV") == "production",
		SameSite: "Lax",
		Expires:  time.Now().Add(-time.Hour),
		Path:     "/",
	})
}

// normalizeRole validates the register request role against a whitelist.
// Empty value (older clients that don't send a role) defaults to "user".
// Values outside the whitelist are rejected so we never trust client input as-is.
func normalizeRole(role string) (string, error) {
	if role == "" {
		return "user", nil
	}
	if role != "user" && role != "collector" {
		return "", errors.New("invalid role, only 'user' or 'collector'")
	}
	return role, nil
}

func RegisterUser(c *fiber.Ctx) error {
	start := time.Now()
	req := new(RegisterRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request format"})
	}

	role, err := normalizeRole(req.Role)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
		Role:     role,
	}

	svc := getAuthService()
	if err := svc.Register(user); err != nil {
		log.Printf("⚠️ [Register] Error: %v\n", err)
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Register] User registered | Email: %s | Exec: %v\n", user.Email, time.Since(start))
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Registration successful",
		"data": fiber.Map{
			"id":           user.ID,
			"name":         user.Name,
			"email":        user.Email,
			"role":         user.Role,
			"karma_points": user.KarmaPoints,
		},
	})
}

func LoginUser(c *fiber.Ctx) error {
	start := time.Now()
	req := new(LoginRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request format"})
	}

	svc := getAuthService()
	token, user, err := svc.Login(req.Email, req.Password)
	if err != nil {
		log.Printf("⚠️ [Login] Failed from IP %s: %v\n", c.IP(), err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	// Token sent via httpOnly cookie, not in the response body
	setAuthCookie(c, token)

	log.Printf("✅ [Login] Success | Email: %s | Exec: %v\n", req.Email, time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Login successful",
		"data": fiber.Map{
			"id":           user.ID,
			"name":         user.Name,
			"email":        user.Email,
			"role":         user.Role,
			"karma_points": user.KarmaPoints,
		},
	})
}

// LogoutUser removes the session cookie from the browser.
func LogoutUser(c *fiber.Ctx) error {
	clearAuthCookie(c)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Successfully logged out",
	})
}

// GetProfile retrieves the logged-in user's data to sync the Frontend UI
func GetProfile(c *fiber.Ctx) error {
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid session",
		})
	}

	svc := getAuthService()
	user, err := svc.GetProfile(uint(userIDFloat))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": err.Error(),
		})
	}

	log.Printf("✅ [Profile] Data accessed successfully | UserID: %d\n", user.ID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   user,
	})
}

// UpdateProfile updates the logged-in user's profile (name & partner data).
// user_id is taken from the JWT in Locals, not the body, so a user cannot edit
// another account.
func UpdateProfile(c *fiber.Ctx) error {
	start := time.Now()
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid session",
		})
	}

	req := new(UpdateProfileRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request format"})
	}

	svc := getAuthService()
	user, err := svc.UpdateProfile(uint(userIDFloat), services.ProfileUpdate{
		Name:              strings.TrimSpace(req.Name),
		VehicleType:       strings.TrimSpace(req.VehicleType),
		ServiceArea:       strings.TrimSpace(req.ServiceArea),
		BankName:          strings.TrimSpace(req.BankName),
		BankAccountNumber: strings.TrimSpace(req.BankAccountNumber),
	})
	if err != nil {
		log.Printf("⚠️ [Profile] Update failed | UserID: %d | %v\n", uint(userIDFloat), err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Profile] Update success | UserID: %d | Exec: %v\n", user.ID, time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   user,
	})
}

// RedeemKarma swaps user karma for simulated Rupiah (rate 1 karma = Rp50).
// Karma balance really decreases in the backend (atomic transaction in the
// service layer); "fund transfer" is only simulated. user_id from the JWT, not body.
func RedeemKarma(c *fiber.Ctx) error {
	start := time.Now()
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid session",
		})
	}

	req := new(RedeemKarmaRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request format"})
	}

	svc := getAuthService()
	newBalance, err := svc.RedeemKarma(uint(userIDFloat), req.AmountKarma)
	if err != nil {
		log.Printf("⚠️ [Redeem] Failed | UserID: %d | %v\n", uint(userIDFloat), err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Redeem] Success | UserID: %d | Exec: %v\n", uint(userIDFloat), time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"new_balance":  newBalance,
			"rupiah_value": req.AmountKarma * services.KarmaToRupiahRate,
		},
	})
}

// RedeemEarnings withdraws collector earnings (Rupiah) to the collector's payment
// method. Balance really decreases in the backend (atomic transaction in the
// service layer); "fund transfer" is only simulated. user_id from JWT, not body.
// This endpoint is collector-role only (checked in main.go via RequireRole).
func RedeemEarnings(c *fiber.Ctx) error {
	start := time.Now()
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid session",
		})
	}

	req := new(RedeemEarningsRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request format"})
	}

	svc := getAuthService()
	newBalance, err := svc.RedeemEarnings(uint(userIDFloat), req.AmountRupiah)
	if err != nil {
		log.Printf("⚠️ [Redeem-Earnings] Failed | UserID: %d | %v\n", uint(userIDFloat), err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Redeem-Earnings] Success | UserID: %d | Exec: %v\n", uint(userIDFloat), time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"new_balance": newBalance,
		},
	})
}
