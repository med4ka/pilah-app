package main

import (
	"log"
	"os"

	"backend/internal/config"
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	log.Println("Memulai inisialisasi sistem Pilah...")

	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: File .env tidak ditemukan, menggunakan environment system")
	}

	config.ConnectDB()

	app := fiber.New(fiber.Config{
		AppName:               "Pilah API v1.0",
		DisableStartupMessage: true,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, HEAD, PUT, DELETE, PATCH",
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

	api.Get("/users/me", middleware.Protected(), handlers.GetProfile)

	pickupGroup := api.Group("/pickups", middleware.Protected())
	pickupGroup.Post("/", handlers.CreatePickup)
	pickupGroup.Get("/history", handlers.GetUserHistory)
	pickupGroup.Get("/collector-history", handlers.GetCollectorHistory)
	pickupGroup.Patch("/:id/confirm", handlers.UserConfirmPickup)

	collectorGroup := api.Group("/collector")
	collectorGroup.Get("/pending", handlers.GetPendingPickups)
	collectorGroup.Patch("/pickups/:id/accept", middleware.Protected(), handlers.AcceptPickup)
	collectorGroup.Patch("/pickups/:id/complete", middleware.Protected(), handlers.CompletePickup)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server Fiber berjalan di port %s...\n", port)
	log.Fatal(app.Listen(":" + port))
}
