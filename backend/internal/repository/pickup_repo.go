package repository

import (
	"backend/internal/models" // Pastikan sesuai dengan nama module Anda
	"errors"

	"gorm.io/gorm"
)

// Interface untuk abstraksi & mempermudah unit testing nantinya
type PickupRepository interface {
	Create(pickup *models.Pickup) error
	GetPendingPickups() ([]models.Pickup, error)
	AcceptPickup(pickupID string, collectorID uint) error
}

type pickupRepo struct {
	db *gorm.DB
}

func NewPickupRepository(db *gorm.DB) PickupRepository {
	return &pickupRepo{db}
}

// 1. Membuat order baru
func (r *pickupRepo) Create(pickup *models.Pickup) error {
	return r.db.Create(pickup).Error
}

// 2. Mengambil order yang masih menunggu (Efisien: filter di level DB)
func (r *pickupRepo) GetPendingPickups() ([]models.Pickup, error) {
	var pickups []models.Pickup
	// CONSTRAINTS CHECK: Hanya ambil kolom yang perlu dan filter status
	err := r.db.Where("status = ?", "PENDING").Find(&pickups).Error
	return pickups, err
}

// 3. Kolektor menerima order
func (r *pickupRepo) AcceptPickup(pickupID string, collectorID uint) error {
	// CONSTRAINTS CHECK: Mencegah Race Condition (2 kolektor pencet bersamaan)
	// Query ini mengunci baris spesifik dan memastikan statusnya MASIH PENDING saat di-update.
	result := r.db.Model(&models.Pickup{}).
		Where("id = ? AND status = ?", pickupID, "PENDING").
		Updates(map[string]interface{}{
			"collector_id": collectorID,
			"status":       "ACCEPTED",
		})

	if result.Error != nil {
		return result.Error
	}

	// Jika tidak ada baris yang ter-update (mungkin keduluan orang lain / order fiktif)
	if result.RowsAffected == 0 {
		return errors.New("order sudah diambil orang lain atau tidak ditemukan")
	}

	return nil
}
