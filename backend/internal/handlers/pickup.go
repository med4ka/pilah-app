package handlers

import (
	"log"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/services"
	"backend/internal/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func getPickupService() services.PickupService {
	repo := repository.NewPickupRepository(config.DB)
	return services.NewPickupService(repo)
}

type CreatePickupPayload struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type SubmitWeightsPayload struct {
	PlasticWeight   float64 `json:"plastic_weight"`
	CardboardWeight float64 `json:"cardboard_weight"`
	GlassWeight     float64 `json:"glass_weight"`
	PhotoURL        string  `json:"photo_url"`
}

func CreatePickup(c *fiber.Ctx) error {
	start := time.Now()
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Akses ditolak"})
	}
	userID := uint(userIDFloat)

	req := new(CreatePickupPayload)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Format koordinat tidak valid"})
	}

	svc := getPickupService()
	pickup, err := svc.CreatePickup(userID, req.Latitude, req.Longitude)
	if err != nil {
		log.Printf("[Pickup] Error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("[Pickup] Created | ID: %s | User: %d | Exec: %v\n", pickup.ID, userID, time.Since(start))
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Pahlawan kebersihan sedang dicarikan untuk Anda",
		"data":    fiber.Map{"pickup_id": pickup.ID, "status": pickup.Status},
	})
}

func GetUserHistory(c *fiber.Ctx) error {
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Sesi tidak valid"})
	}

	var pickups []models.Pickup
	if err := config.DB.Where("user_id = ?", uint(userIDFloat)).Order("created_at desc").Find(&pickups).Error; err != nil {
		log.Printf("[History] Gagal tarik data UserID %d: %v\n", uint(userIDFloat), err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Gagal memuat riwayat"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "data": pickups})
}

func CompletePickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")
	req := new(SubmitWeightsPayload)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Payload JSON tidak valid"})
	}

	var pickup models.Pickup
	if err := config.DB.Where("id = ?", pickupID).First(&pickup).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Orderan tidak ditemukan"})
	}

	pickup.PlasticWeight = req.PlasticWeight
	pickup.CardboardWeight = req.CardboardWeight
	pickup.GlassWeight = req.GlassWeight
	pickup.Status = "VERIFYING"
	pickup.PhotoURL = req.PhotoURL

	if err := config.DB.Save(&pickup).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Gagal update database"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "success", "message": "Data terkirim!"})
}

func UserConfirmPickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var pickup models.Pickup
	if err := config.DB.Where("id = ? AND status = ?", pickupID, "VERIFYING").First(&pickup).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Orderan tidak ditemukan"})
	}

	karmaPlastik := pickup.PlasticWeight * 10
	karmaKardus := pickup.CardboardWeight * 7
	karmaKaca := pickup.GlassWeight * 15
	calculatedKarma := int(karmaPlastik + karmaKardus + karmaKaca)

	pickup.Status = "COMPLETED"
	if err := config.DB.Save(&pickup).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Gagal menyelesaikan order"})
	}

	if err := config.DB.Model(&models.User{}).Where("id = ?", pickup.UserID).Update("karma_points", gorm.Expr("karma_points + ?", calculatedKarma)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Gagal mentransfer Karma"})
	}

	go func(p models.Pickup, points int) {
		payload := map[string]interface{}{
			"order_id":       p.ID,
			"user_id":        p.UserID,
			"verification":   "Two-Way Handshake Approved",
			"reward_points":  points,
			"timestamp":      time.Now().Format(time.RFC3339),
			"anti_fraud_log": "Secure Verified",
		}
		hash, err := utils.PinJSONToIPFS(payload)
		if err != nil {
			log.Printf("[WEB3 ERROR] Gagal pin ke IPFS untuk Order %s: %v\n", p.ID, err)
			return
		}

		config.DB.Model(&p).Update("ipfs_hash", hash)
	}(pickup, calculatedKarma)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Handshake sukses! Sampahmu resmi diubah jadi berkah.",
		"karma":   calculatedKarma,
	})
}
