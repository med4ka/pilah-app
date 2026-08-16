package repository

import (
	"errors"
	"time"

	"backend/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ErrPickupNotFound marks "not found" without leaking whether a record actually
// exists but does not belong to the caller.
var ErrPickupNotFound = errors.New("pickup not found")

type PickupRepository interface {
	Create(pickup *models.Pickup) error
	GetPendingPickups() ([]models.Pickup, error)
	GetUserHistory(userID uint) ([]models.Pickup, error)
	GetCollectorHistory(collectorID uint) ([]models.Pickup, error)
	AcceptPickup(pickupID string, collectorID uint) error
	CancelExpiredPendingPickups(tx *gorm.DB, before time.Time, userID *uint) error

	// Transactions: Begin/Commit/Rollback orchestrated by the service; all queries stay here.
	Begin() *gorm.DB
	FindByIDForUser(tx *gorm.DB, pickupID string, userID uint) (*models.Pickup, error)
	FindByIDForCollector(tx *gorm.DB, pickupID string, collectorID uint) (*models.Pickup, error)
	UpdateStatus(tx *gorm.DB, pickup *models.Pickup) error
	SubmitVerification(tx *gorm.DB, pickup *models.Pickup) error
	AddKarma(tx *gorm.DB, userID uint, points int) error
	AddEarnings(tx *gorm.DB, userID uint, amount int64) error
	SaveIPFSHash(pickupID, hash string) error
}

type pickupRepo struct {
	db *gorm.DB
}

func NewPickupRepository(db *gorm.DB) PickupRepository {
	return &pickupRepo{db}
}

func (r *pickupRepo) Begin() *gorm.DB {
	return r.db.Begin()
}

func (r *pickupRepo) Create(pickup *models.Pickup) error {
	return r.db.Create(pickup).Error
}

func (r *pickupRepo) GetPendingPickups() ([]models.Pickup, error) {
	var pickups []models.Pickup
	err := r.db.Where("status = ?", "PENDING").Order("created_at asc").Limit(20).Find(&pickups).Error
	return pickups, err
}

func (r *pickupRepo) GetUserHistory(userID uint) ([]models.Pickup, error) {
	var pickups []models.Pickup
	err := r.db.Where("user_id = ?", userID).Order("created_at desc").Find(&pickups).Error
	return pickups, err
}

func (r *pickupRepo) GetCollectorHistory(collectorID uint) ([]models.Pickup, error) {
	var pickups []models.Pickup
	err := r.db.Where("collector_id = ?", collectorID).Order("updated_at desc").Limit(50).Find(&pickups).Error
	return pickups, err
}

// CancelExpiredPendingPickups cancels pickups still PENDING and created before
// `before` (lazy auto-cancel). userID scope is optional: non-nil = only that
// user's pickups (resident history), nil = everyone (collector radar). The
// WHERE status PENDING guard keeps it from touching pickups a collector is
// processing, and is safe against races with AcceptPickup which locks status=PENDING.
func (r *pickupRepo) CancelExpiredPendingPickups(tx *gorm.DB, before time.Time, userID *uint) error {
	q := tx.Model(&models.Pickup{}).Where("status = ? AND created_at < ?", "PENDING", before)
	if userID != nil {
		q = q.Where("user_id = ?", *userID)
	}
	return q.Update("status", "CANCELLED").Error
}

func (r *pickupRepo) AcceptPickup(pickupID string, collectorID uint) error {
	// Row lock FOR UPDATE inside a single transaction stops two collectors from
	// accepting the same pickup concurrently (race condition).
	return r.db.Transaction(func(tx *gorm.DB) error {
		var pickup models.Pickup
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND status = ?", pickupID, "PENDING").
			First(&pickup).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrPickupNotFound
			}
			return err
		}

		return tx.Model(&pickup).Updates(map[string]interface{}{
			"collector_id": collectorID,
			"status":       "ACCEPTED",
		}).Error
	})
}

// FindByIDForUser fetches a pickup belonging to a given user that awaits
// resident confirmation (status VERIFYING — collector already submitted weight+photo).
func (r *pickupRepo) FindByIDForUser(tx *gorm.DB, pickupID string, userID uint) (*models.Pickup, error) {
	var pickup models.Pickup
	err := tx.Where("id = ? AND user_id = ? AND status = ?", pickupID, userID, "VERIFYING").First(&pickup).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrPickupNotFound
	}
	if err != nil {
		return nil, err
	}
	return &pickup, nil
}

// FindByIDForCollector fetches the pickup a given collector is working on (ownership check).
func (r *pickupRepo) FindByIDForCollector(tx *gorm.DB, pickupID string, collectorID uint) (*models.Pickup, error) {
	var pickup models.Pickup
	err := tx.Where("id = ? AND collector_id = ? AND status = ?", pickupID, collectorID, "ACCEPTED").First(&pickup).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrPickupNotFound
	}
	if err != nil {
		return nil, err
	}
	return &pickup, nil
}

func (r *pickupRepo) UpdateStatus(tx *gorm.DB, pickup *models.Pickup) error {
	return tx.Model(pickup).Update("status", pickup.Status).Error
}

// SubmitVerification is called by the collector when handing over verification
// data: status ACCEPTED -> VERIFYING plus per-material weight & proof photo.
// Karma is NOT transferred here — it only happens when the resident confirms (ConfirmPickup).
func (r *pickupRepo) SubmitVerification(tx *gorm.DB, pickup *models.Pickup) error {
	return tx.Model(&models.Pickup{}).
		Where("id = ?", pickup.ID).
		Updates(map[string]interface{}{
			"status":           "VERIFYING",
			"plastic_weight":   pickup.PlasticWeight,
			"cardboard_weight": pickup.CardboardWeight,
			"glass_weight":     pickup.GlassWeight,
			"photo_url":        pickup.PhotoURL,
		}).Error
}

func (r *pickupRepo) AddKarma(tx *gorm.DB, userID uint, points int) error {
	return tx.Model(&models.User{}).Where("id = ?", userID).Update("karma_points", gorm.Expr("karma_points + ?", points)).Error
}

func (r *pickupRepo) AddEarnings(tx *gorm.DB, userID uint, amount int64) error {
	return tx.Model(&models.User{}).Where("id = ?", userID).Update("collector_earnings", gorm.Expr("collector_earnings + ?", amount)).Error
}

func (r *pickupRepo) SaveIPFSHash(pickupID, hash string) error {
	return r.db.Model(&models.Pickup{}).Where("id = ?", pickupID).Update("ipfs_hash", hash).Error
}
