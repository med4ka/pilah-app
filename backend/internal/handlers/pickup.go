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

func CreatePickup(c *fiber.Ctx) error {
	start := time.Now()

	// JWT claims menyimpan angka sebagai float64, kita ubah ke uint dengan aman
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Akses ditolak"})
	}
	userID := uint(userIDFloat)

	req := new(CreatePickupPayload)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Format koordinat tidak valid"})
	}

	// Panggil Service Layer
	svc := getPickupService()
	pickup, err := svc.CreatePickup(userID, req.Latitude, req.Longitude)
	if err != nil {
		log.Printf("❌ [Pickup] Error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	log.Printf("✅ [Pickup] Created | ID: %s | User: %d | Exec: %v\n", pickup.ID, userID, time.Since(start))
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Pahlawan kebersihan sedang dicarikan untuk Anda",
		"data":    fiber.Map{"pickup_id": pickup.ID, "status": pickup.Status},
	})
}

// ==========================================
// 📍 VIBE CODE: GET USER HISTORY (Optimized)
// ==========================================

// GetUserHistory mengambil riwayat jemputan khusus untuk user yang sedang login
func GetUserHistory(c *fiber.Ctx) error {
	// Ambil user_id dari token JWT
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Sesi tidak valid",
		})
	}

	var pickups []models.Pickup
	// ⚡ PERFORMANCE CONSTRAINT: Tarik data berdasar User ID, urutkan dari yang terbaru
	if err := config.DB.Where("user_id = ?", uint(userIDFloat)).Order("created_at desc").Find(&pickups).Error; err != nil {
		log.Printf("❌ [History] Gagal tarik data UserID %d: %v\n", uint(userIDFloat), err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Gagal memuat riwayat",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   pickups,
	})
}

// ==========================================
// 📍 VIBE CODE: KARMA ENGINE + WEB3 PROOF
// ==========================================

func CompletePickup(c *fiber.Ctx) error {
	pickupID := c.Params("id")

	// ⚡ SECURITY CONSTRAINT: Database Transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var pickup models.Pickup
	if err := tx.Where("id = ? AND status = ?", pickupID, "ACCEPTED").First(&pickup).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Orderan tidak valid"})
	}

	pickup.Status = "COMPLETED"
	if err := tx.Save(&pickup).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Gagal update order"})
	}

	// Transfer 50 Karma
	if err := tx.Model(&models.User{}).Where("id = ?", pickup.UserID).Update("karma_points", gorm.Expr("karma_points + ?", 50)).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Gagal mentransfer Karma"})
	}

	tx.Commit()

	// 📝 PROPER LOGGING
	log.Printf("✅ [KARMA ENGINE] Order %s Selesai | +50 Karma ke User %d\n", pickupID, pickup.UserID)

	// 🚀 WEB3 INTEGRATION (BACKGROUND TASK / GOROUTINE)
	// Kita lempar ke background biar UI Kolektor gak nge-freeze nungguin IPFS!
	go func(p models.Pickup) {
		payload := map[string]interface{}{
			"order_id":  p.ID,
			"user_id":   p.UserID,
			"action":    "Recycled Waste",
			"reward":    "+50 Karma",
			"timestamp": time.Now().Format(time.RFC3339),
			"platform":  "Pilah App Web 2.5",
		}

		hash, err := utils.PinJSONToIPFS(payload)
		if err != nil {
			log.Printf("⚠️ [WEB3 ERROR] Gagal pin ke IPFS untuk Order %d: %v\n", p.ID, err)
			return
		}

		// Update database dengan IPFS Hash secara senyap
		config.DB.Model(&p).Update("ipfs_hash", hash)
		log.Printf("🌐 [WEB3 SUCCESS] Order %d tercatat di IPFS: ipfs://%s\n", p.ID, hash)
	}(pickup)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Orderan selesai, Karma didistribusikan!",
	})
}
