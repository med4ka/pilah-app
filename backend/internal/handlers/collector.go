package handlers

import (
	"log"
	"time"

	"backend/internal/config"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

func GetPendingPickups(c *fiber.Ctx) error {
	start := time.Now()
	var pickups []models.Pickup

	result := config.DB.Where("status = ?", "PENDING").Order("created_at asc").Limit(20).Find(&pickups)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Gagal memuat radar"})
	}

	log.Printf("[Collector] Radar | Found: %d | Exec: %v\n", len(pickups), time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "data": pickups})
}

func AcceptPickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")

	collectorIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Sesi tidak valid"})
	}
	collectorID := uint(collectorIDFloat)

	svc := getPickupService()

	err := svc.AcceptPickup(pickupID, collectorID)
	if err != nil {
		if err.Error() == "order sudah diambil orang lain atau tidak ditemukan" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "Waduh, orderan ini sudah diambil kolektor lain!",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil orderan",
		})
	}

	log.Printf("[Collector] Order %s DIAMBIL oleh Kolektor %d\n", pickupID, collectorID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Gas! Orderan berhasil diamankan.",
	})
}

func GetCollectorHistory(c *fiber.Ctx) error {
	collectorIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Sesi tidak valid"})
	}

	var pickups []models.Pickup

	if err := config.DB.Where("collector_id = ?", uint(collectorIDFloat)).Order("updated_at desc").Limit(50).Find(&pickups).Error; err != nil {
		log.Printf("[Collector History] Error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal memuat riwayat pekerjaan",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   pickups,
	})
}
