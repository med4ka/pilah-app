package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
)

type PickupService interface {
	CreatePickup(userID uint, lat, lng float64) (*models.Pickup, error)
	GetPendingPickups() ([]models.Pickup, error)
	AcceptPickup(pickupID string, collectorID uint) error
}

type pickupService struct {
	repo repository.PickupRepository
}

func NewPickupService(repo repository.PickupRepository) PickupService {
	return &pickupService{repo}
}

func (s *pickupService) CreatePickup(userID uint, lat, lng float64) (*models.Pickup, error) {
	if lat == 0 || lng == 0 {
		return nil, errors.New("koordinat lokasi tidak valid, pastikan GPS menyala")
	}

	pickup := &models.Pickup{
		UserID:    userID,
		Latitude:  lat,
		Longitude: lng,
		Status:    "PENDING",
	}

	err := s.repo.Create(pickup)
	if err != nil {
		return nil, errors.New("gagal membuat permintaan jemputan")
	}

	return pickup, nil
}

func (s *pickupService) GetPendingPickups() ([]models.Pickup, error) {
	return s.repo.GetPendingPickups()
}

func (s *pickupService) AcceptPickup(pickupID string, collectorID uint) error {
	if pickupID == "" {
		return errors.New("ID order tidak valid")
	}
	return s.repo.AcceptPickup(pickupID, collectorID)
}
