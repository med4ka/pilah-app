package repository

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

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

func (r *pickupRepo) Create(pickup *models.Pickup) error {
	return r.db.Create(pickup).Error
}

func (r *pickupRepo) GetPendingPickups() ([]models.Pickup, error) {
	var pickups []models.Pickup
	err := r.db.Where("status = ?", "PENDING").Find(&pickups).Error
	return pickups, err
}

func (r *pickupRepo) AcceptPickup(pickupID string, collectorID uint) error {
	result := r.db.Model(&models.Pickup{}).
		Where("id = ? AND status = ?", pickupID, "PENDING").
		Updates(map[string]interface{}{
			"collector_id": collectorID,
			"status":       "ACCEPTED",
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("order sudah diambil orang lain atau tidak ditemukan")
	}

	return nil
}
