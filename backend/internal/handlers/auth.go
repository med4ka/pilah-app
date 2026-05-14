package handlers

import (
	"log"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// Helper function untuk memanggil Service Layer (Clean Architecture)
func getAuthService() services.AuthService {
	repo := repository.NewUserRepository(config.DB)
	return services.NewAuthService(repo, "pilah_super_secret_key_2026")
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterUser(c *fiber.Ctx) error {
	start := time.Now()
	req := new(RegisterRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Format request tidak valid"})
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	// Panggil Otak Sistem (Service)
	svc := getAuthService()
	if err := svc.Register(user); err != nil {
		log.Printf("⚠️ [Register] Error: %v\n", err)
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Register] User terdaftar | Email: %s | Exec: %v\n", user.Email, time.Since(start))
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Registrasi berhasil",
		"data":    fiber.Map{"id": user.ID, "name": user.Name, "email": user.Email},
	})
}

func LoginUser(c *fiber.Ctx) error {
	start := time.Now()
	req := new(LoginRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Format request tidak valid"})
	}

	svc := getAuthService()
	token, err := svc.Login(req.Email, req.Password)
	if err != nil {
		log.Printf("⚠️ [Login] Gagal dari IP %s: %v\n", c.IP(), err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Login] Sukses | Email: %s | Exec: %v\n", req.Email, time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Login berhasil",
		"data":    fiber.Map{"token": token},
	})
}

// ==========================================
// 📍 VIBE CODE: GET PROFILE (Optimized)
// ==========================================

// GetProfile mengambil data user yang sedang login untuk sinkronisasi UI Frontend
func GetProfile(c *fiber.Ctx) error {
	// Ambil user_id dari JWT yang sudah divalidasi oleh middleware
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Sesi tidak valid",
		})
	}

	var user models.User
	// ⚡ PERFORMANCE CONSTRAINT: Hindari SELECT *
	// Kita hanya mengambil kolom yang benar-benar dibutuhkan oleh Frontend (Zustand)
	// untuk menghemat alokasi memori dan mempercepat respon.
	result := config.DB.Select("id", "name", "email", "karma_points", "role").Where("id = ?", uint(userIDFloat)).First(&user)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Data pengguna tidak ditemukan",
		})
	}

	// Proper Logging untuk tracing
	log.Printf("✅ [Profile] Data berhasil diakses | UserID: %d\n", user.ID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   user,
	})
}
