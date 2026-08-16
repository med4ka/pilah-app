package handlers

import (
	"errors"
	"log"
	"time"

	"backend/internal/repository"

	"github.com/gofiber/fiber/v2"
)

// GetPendingPickups retrieves orders that are still in PENDING status
func GetPendingPickups(c *fiber.Ctx) error {
	start := time.Now()

	svc := getPickupService()
	pickups, err := svc.GetPendingPickups()
	if err != nil {
		log.Printf("❌ [Radar] Error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to load radar"})
	}

	log.Printf("📡 [Collector] Radar | Found: %d | Exec: %v\n", len(pickups), time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "data": pickups})
}

// AcceptPickup changes an order's status from PENDING to ACCEPTED
func AcceptPickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")

	collectorIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid session"})
	}
	collectorID := uint(collectorIDFloat)

	if pickupID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid order ID"})
	}

	svc := getPickupService()
	err := svc.AcceptPickup(pickupID, collectorID)
	if err != nil {
		if errors.Is(err, repository.ErrPickupNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "Oops, this order has already been taken by another collector!",
			})
		}
		log.Printf("❌ [Collector] Accept error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to take the order",
		})
	}

	log.Printf("🚚 [Collector] Order %s TAKEN by Collector %d\n", pickupID, collectorID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Go! Order secured successfully.",
	})
}

// GetCollectorHistory retrieves the logged-in collector's work history
func GetCollectorHistory(c *fiber.Ctx) error {
	collectorIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid session"})
	}

	svc := getPickupService()
	pickups, err := svc.GetCollectorHistory(uint(collectorIDFloat))
	if err != nil {
		log.Printf("❌ [Collector History] Error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to load work history",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   pickups,
	})
}