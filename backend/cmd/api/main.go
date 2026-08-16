package main

import (
	"log"
	"os"
	"strings"

	"backend/internal/config"
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	log.Println("Initializing Pilah system...")

	config.ConnectDB()

	// JWT_SECRET read once at startup — required, no hardcoded fallback.
	// Server must not run without a valid secret.
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET must be set in the environment before the server runs")
	}
	config.JWTSecret = jwtSecret

	app := fiber.New(fiber.Config{
		AppName:               "Pilah API v1.0",
		DisableStartupMessage: true,
	})

	// CORS origins read from env ALLOWED_ORIGINS (comma-separated).
	// Fallback to localhost only for dev convenience when env is empty.
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if strings.TrimSpace(allowedOrigins) == "" {
		allowedOrigins = "http://localhost:3000, http://localhost:3001"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH",
		AllowCredentials: true,
	}))
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	api := app.Group("/api/v1")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Pilah Core Backend is up and running",
		})
	})

	authGroup := api.Group("/auth")
	authGroup.Post("/register", handlers.RegisterUser)
	authGroup.Post("/login", handlers.LoginUser)
	authGroup.Post("/logout", handlers.LogoutUser)

	api.Get("/users/me", middleware.Protected(), handlers.GetProfile)
	api.Patch("/users/me", middleware.Protected(), handlers.UpdateProfile)

	// Swap Cuan: karma -> simulated Rupiah. Karma balance decreases REAL in DB,
	// payout only simulated (no real payment gateway).
	api.Post("/karma/redeem", middleware.Protected(), handlers.RedeemKarma)

	// Collector income: pickup earnings -> simulated withdrawal to collector's
	// payment method. Balance decreases REAL in DB, payout simulated.
	// Collector role only (RequireRole must come after Protected).
	api.Post("/earnings/redeem", middleware.Protected(), middleware.RequireRole("collector"), handlers.RedeemEarnings)

	pickupGroup := api.Group("/pickups", middleware.Protected())
	pickupGroup.Post("/", handlers.CreatePickup)
	pickupGroup.Get("/history", handlers.GetUserHistory)
	pickupGroup.Get("/collector-history", middleware.RequireRole("collector"), handlers.GetCollectorHistory)
	pickupGroup.Patch("/:id/confirm", handlers.UserConfirmPickup)

	collectorGroup := api.Group("/collector")
	collectorGroup.Get("/pending", handlers.GetPendingPickups)
	collectorGroup.Patch("/pickups/:id/accept", middleware.Protected(), middleware.RequireRole("collector"), handlers.AcceptPickup)
	collectorGroup.Patch("/pickups/:id/complete", middleware.Protected(), middleware.RequireRole("collector"), handlers.CompletePickup)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Fiber server running on port %s...\n", port)
	log.Fatal(app.Listen(":" + port))
}