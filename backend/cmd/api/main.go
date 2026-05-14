package main

import (
	"log"

	"backend/internal/config"
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	log.Println("Memulai inisialisasi sistem Pilah...")

	// 1. Inisialisasi Database (Auto-Migrate sudah jalan otomatis di dalam sini)
	config.ConnectDB()

	// 2. Inisialisasi Fiber App (Ultra-Lightweight Mode)
	app := fiber.New(fiber.Config{
		AppName:               "Pilah API v1.0",
		DisableStartupMessage: true,
	})

	// 3. Global Middleware (Security & Proper Logging)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, HEAD, PUT, DELETE, PATCH",
	}))

	// Cegah app mati jika ada panic error
	app.Use(recover.New())
	// Logging yang rapi untuk setiap request
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))

	// 4. Setup Routing API
	api := app.Group("/api/v1")

	// Endpoint Health Check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Pilah Core Backend is up and running",
		})
	})

	// ==========================================
	// 📍 VIBE CODE: ROUTING LAYER
	// ==========================================
	authGroup := api.Group("/auth")
	authGroup.Post("/register", handlers.RegisterUser)
	authGroup.Post("/login", handlers.LoginUser)

	// [+] INI DIA RUTE YANG HILANG KEMARIN!
	// Menggunakan Protected() agar hanya token valid yang bisa meminta profil
	api.Get("/users/me", middleware.Protected(), handlers.GetProfile)

	// Middleware Protected() memastikan hanya user dengan JWT valid yang bisa akses
	pickupGroup := api.Group("/pickups", middleware.Protected())
	pickupGroup.Post("/", handlers.CreatePickup)
	pickupGroup.Get("/history", handlers.GetUserHistory)
	pickupGroup.Get("/collector-history", handlers.GetCollectorHistory)

	collectorGroup := api.Group("/collector")
	collectorGroup.Get("/pending", handlers.GetPendingPickups)
	collectorGroup.Patch("/pickups/:id/accept", middleware.Protected(), handlers.AcceptPickup)
	collectorGroup.Patch("/pickups/:id/complete", middleware.Protected(), handlers.CompletePickup)

	// 5. Jalankan Server
	log.Println("Server Fiber berjalan di port 8080...")
	log.Fatal(app.Listen(":8080"))
}
