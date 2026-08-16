package handlers

import (
	"errors"
	"log"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

func getPickupService() services.PickupService {
	repo := repository.NewPickupRepository(config.DB)
	return services.NewPickupService(repo)
}

type CreatePickupPayload struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	// Resident estimate (optional, default 0): reference for collectors on radar.
	EstPlasticWeight   float64 `json:"est_plastic_weight"`
	EstCardboardWeight float64 `json:"est_cardboard_weight"`
	EstGlassWeight     float64 `json:"est_glass_weight"`
}

func CreatePickup(c *fiber.Ctx) error {
	start := time.Now()

	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Access denied"})
	}
	userID := uint(userIDFloat)

	req := new(CreatePickupPayload)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid coordinate format"})
	}

	svc := getPickupService()
	pickup, err := svc.CreatePickup(userID, req.Latitude, req.Longitude, req.EstPlasticWeight, req.EstCardboardWeight, req.EstGlassWeight)
	if err != nil {
		log.Printf("❌ [Pickup] Error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Pickup] Created | ID: %s | User: %d | Exec: %v\n", pickup.ID, userID, time.Since(start))
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "A cleanliness hero is being found for you",
		"data":    fiber.Map{"pickup_id": pickup.ID, "status": pickup.Status},
	})
}

// GetUserHistory retrieves pickup history belonging to the logged-in user
func GetUserHistory(c *fiber.Ctx) error {
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid session",
		})
	}

	svc := getPickupService()
	pickups, err := svc.GetUserHistory(uint(userIDFloat))
	if err != nil {
		log.Printf("❌ [History] Failed to fetch data UserID %d: %v\n", uint(userIDFloat), err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to load history",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   pickups,
	})
}

// UserConfirmPickup confirms a pickup by its resident owner after the collector
// submits weight+photo (status VERIFYING). Response carries the karma earned.
func UserConfirmPickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")

	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid session"})
	}
	userID := uint(userIDFloat)

	if pickupID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid order ID"})
	}

	svc := getPickupService()
	karma, err := svc.ConfirmPickup(pickupID, userID)
	if err != nil {
		if errors.Is(err, repository.ErrPickupNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "Invalid order",
			})
		}
		log.Printf("❌ [Confirm] Error | User: %d | ID: %s | %v\n", userID, pickupID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Order complete, Karma distributed!",
		"data": fiber.Map{
			"pickup_id": pickupID,
			"karma":     karma,
		},
	})
}

// CompletePickup moves a pickup from ACCEPTED to VERIFYING by the collector who
// accepted the order. The collector sends weight per material + proof photo.
// Karma is only transferred after the resident confirms (UserConfirmPickup).
func CompletePickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")

	collectorIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid session"})
	}
	collectorID := uint(collectorIDFloat)

	if pickupID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid order ID"})
	}

	verification := new(models.PickupVerification)
	if len(c.Body()) > 0 {
		if err := c.BodyParser(verification); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid verification data format"})
		}
	}

	svc := getPickupService()
	err := svc.CompletePickup(pickupID, collectorID, *verification)
	if err != nil {
		if errors.Is(err, repository.ErrPickupNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "Invalid order",
			})
		}
		log.Printf("❌ [Complete] Error | Collector: %d | ID: %s | %v\n", collectorID, pickupID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Weight recorded, awaiting resident confirmation.",
	})
}