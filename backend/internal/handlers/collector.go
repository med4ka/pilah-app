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

	log.Printf("📡 [Collector] Radar | Found: %d | Exec: %v\n", len(pickups), time.Since(start))
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "data": pickups})
}

func AcceptPickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")

	collectorIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Sesi tidak valid"})
	}
	collectorID := uint(collectorIDFloat)

	if pickupID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "ID orderan tidak valid"})
	}

	var pickup models.Pickup

	if err := config.DB.Where("id = ? AND status = ?", pickupID, "PENDING").First(&pickup).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Waduh, orderan ini sudah diambil kolektor lain!",
		})
	}

	pickup.Status = "ACCEPTED"
	pickup.CollectorID = &collectorID

	if err := config.DB.Save(&pickup).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal mengambil orderan",
		})
	}

	log.Printf("🚚 [Collector] Order %s DIAMBIL oleh Kolektor %d\n", pickupID, collectorID)

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

	// ⚡ PERFORMANCE CONSTRAINT: Cari berdasarkan collector_id, urutkan dari terbaru, limit 50 data
	if err := config.DB.Where("collector_id = ?", uint(collectorIDFloat)).Order("updated_at desc").Limit(50).Find(&pickups).Error; err != nil {
		log.Printf("❌ [Collector History] Error: %v\n", err)
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
