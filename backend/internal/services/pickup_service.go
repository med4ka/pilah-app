package services

import (
	"errors"
	"log"
	"math"
	"strconv"
	"time"

	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/utils"
)

// PickupExpiryDuration is how long a pickup may stay PENDING before being
// auto-cancelled (CANCELLED). Defined once in the service layer, not a magic
// number scattered around. Auto-cancel runs lazily (checked whenever pickup
// data is read), no cron/scheduler.
const PickupExpiryDuration = 3 * time.Minute

// ── Karma Engine: weight-based reward per material ───────────────────────────
// Karma ratio per kilogram (kg) of sorted waste. Each weight is multiplied by
// its ratio, summed, then rounded to an integer. Basis: the weight submitted by
// the collector in the VERIFYING phase (CompletePickup).
const (
	KarmaPerKgPlastik   = 60
	KarmaPerKgKardus    = 24
	KarmaPerKgKaca      = 6
	minKarmaForValidPickup = 1   // small but valid weight -> avoid 0 karma
	fallbackKarmaOldData    = 5  // all weights 0 (old/empty data) -> minimum karma
)

// ── Earnings Engine: collector earnings (Rupiah) based on weight per material ──
// Earnings ratio per kg. Equivalent to Rp50 per 1 karma (3000/60 = 1200/24 = 300/6 = 50),
// so residents earn karma WHILE collectors earn rupiah from the same pickup.
// Computed from exactly the same weights as calculateKarma, in the same
// transaction at ConfirmPickup, then added to the collector's collector_earnings.
const (
	RupiahPerKgPlastik   = 3000
	RupiahPerKgKardus    = 1200
	RupiahPerKgKaca      = 300
	minEarningsForValidPickup = 50   // small but valid weight -> avoid 0 earnings
	fallbackEarningsOldData    = 250 // all weights 0 (old/empty data) -> minimum earnings
)

// calculateKarma computes the karma reward from the per-material weight already
// weighed by the collector. Rounds to nearest integer (math.Round). Edge cases:
//   - total weight > 0 but rounding yields < 1 (e.g. 0.04 kg glass) -> floor to 1
//     so a valid transaction never yields 0 karma.
//   - all weights 0 (old data / pickup with no weight verification) -> small
//     fallback of 5 as a base reward, so residents don't get 0 for a transaction
//     that genuinely completed.
func calculateKarma(p models.Pickup) int {
	raw := p.PlasticWeight*KarmaPerKgPlastik + p.CardboardWeight*KarmaPerKgKardus + p.GlassWeight*KarmaPerKgKaca
	if raw <= 0 {
		return fallbackKarmaOldData
	}
	karma := int(math.Round(raw))
	if karma < minKarmaForValidPickup {
		return minKarmaForValidPickup
	}
	return karma
}

// calculateEarnings computes a collector's earnings (Rupiah) from the same
// weight as calculateKarma. Its fallback pattern is identical (floor to a
// minimum for small valid weights, fallback for old/empty data) so a collector
// never gets Rp0 for a pickup that genuinely completed.
func calculateEarnings(p models.Pickup) int64 {
	raw := p.PlasticWeight*RupiahPerKgPlastik + p.CardboardWeight*RupiahPerKgKardus + p.GlassWeight*RupiahPerKgKaca
	if raw <= 0 {
		return fallbackEarningsOldData
	}
	earnings := int64(math.Round(raw))
	if earnings < minEarningsForValidPickup {
		return minEarningsForValidPickup
	}
	return earnings
}

type PickupService interface {
	CreatePickup(userID uint, lat, lng, estPlastic, estCardboard, estGlass float64) (*models.Pickup, error)
	GetPendingPickups() ([]models.Pickup, error)
	GetUserHistory(userID uint) ([]models.Pickup, error)
	GetCollectorHistory(collectorID uint) ([]models.Pickup, error)
	AcceptPickup(pickupID string, collectorID uint) error
	CompletePickup(pickupID string, collectorID uint, verification models.PickupVerification) error
	ConfirmPickup(pickupID string, userID uint) (int, error)
}

type pickupService struct {
	repo repository.PickupRepository
}

func NewPickupService(repo repository.PickupRepository) PickupService {
	return &pickupService{repo}
}

// CreatePickup creates a new pickup request (PENDING). The resident's weight
// estimates (estPlastic/estCardboard/estGlass kg) are OPTIONAL and only a
// reference for collectors on the radar — not the source of the final karma.
func (s *pickupService) CreatePickup(userID uint, lat, lng, estPlastic, estCardboard, estGlass float64) (*models.Pickup, error) {
	if lat == 0 || lng == 0 {
		return nil, errors.New("invalid location coordinates, make sure GPS is on")
	}

	pickup := &models.Pickup{
		UserID:           userID,
		Latitude:         lat,
		Longitude:        lng,
		Status:           "PENDING",
		EstPlasticWeight:   estPlastic,
		EstCardboardWeight: estCardboard,
		EstGlassWeight:     estGlass,
	}

	err := s.repo.Create(pickup)
	if err != nil {
		return nil, errors.New("failed to create pickup request")
	}

	return pickup, nil
}

func (s *pickupService) GetPendingPickups() ([]models.Pickup, error) {
	// Lazy auto-cancel (same as GetUserHistory): PENDING pickups past
	// PickupExpiryDuration are cancelled first, so expired pickups vanish from
	// the collector radar too, not just from resident history.
	if err := s.cancelExpiredPendingPickups(nil); err != nil {
		log.Printf("⚠️ [Auto-cancel] Failed to cancel expired pickup (radar): %v\n", err)
	}
	return s.repo.GetPendingPickups()
}

func (s *pickupService) GetUserHistory(userID uint) ([]models.Pickup, error) {
	// Lazy auto-cancel: before returning data, a user's PENDING pickups that are
	// past PickupExpiryDuration are cancelled first.
	if err := s.cancelExpiredPendingPickups(&userID); err != nil {
		log.Printf("⚠️ [Auto-cancel] Failed to cancel expired pickup User %d: %v\n", userID, err)
	}
	pickups, err := s.repo.GetUserHistory(userID)
	if err != nil {
		return nil, err
	}
	// Recompute reward per COMPLETED item from stored weight (no new column)
	// so history shows correct, backend-consistent numbers — one source of
	// truth, frontend doesn't re-implement the formula.
	fillEarnedValues(pickups)
	return pickups, nil
}

// fillEarnedValues fills the transient KarmaEarned & EarningsEarned fields for
// COMPLETED pickups from stored weight. It relies on the exact same
// calculateKarma/calculateEarnings used at ConfirmPickup, so history numbers
// always match what was granted.
func fillEarnedValues(pickups []models.Pickup) {
	for i := range pickups {
		if pickups[i].Status != "COMPLETED" {
			continue
		}
		pickups[i].KarmaEarned = calculateKarma(pickups[i])
		pickups[i].EarningsEarned = calculateEarnings(pickups[i])
	}
}

// cancelExpiredPendingPickups cancels all PENDING pickups past expiry
// (created_at < now - PickupExpiryDuration) in one simple transaction.
// userID optional: nil = all users (collector radar), non-nil = per-user
// (resident history). Results are visible when data is re-read afterwards
// (returns the already-updated data).
func (s *pickupService) cancelExpiredPendingPickups(userID *uint) error {
	tx := s.repo.Begin()
	if err := s.repo.CancelExpiredPendingPickups(tx, time.Now().Add(-PickupExpiryDuration), userID); err != nil {
		tx.Rollback()
		log.Printf("⚠️ [Auto-cancel] Failed to update expired pickup: %v\n", err)
		return err
	}
	if err := tx.Commit().Error; err != nil {
		log.Printf("⚠️ [Auto-cancel] Failed to commit cancel: %v\n", err)
		return err
	}
	return nil
}

func (s *pickupService) GetCollectorHistory(collectorID uint) ([]models.Pickup, error) {
	pickups, err := s.repo.GetCollectorHistory(collectorID)
	if err != nil {
		return nil, err
	}
	fillEarnedValues(pickups)
	return pickups, nil
}

func (s *pickupService) AcceptPickup(pickupID string, collectorID uint) error {
	if pickupID == "" {
		return errors.New("Invalid order ID")
	}
	return s.repo.AcceptPickup(pickupID, collectorID)
}

// CompletePickup marks a pickup as entering VERIFYING by its owner collector
// (ownership check in repo). The collector sends per-material weight + proof photo.
// Status + verification data updates run in one transaction for consistency.
// Karma is NOT transferred here — the resident still has to confirm first.
func (s *pickupService) CompletePickup(pickupID string, collectorID uint, verification models.PickupVerification) error {
	if pickupID == "" {
		return errors.New("Invalid order ID")
	}

	tx := s.repo.Begin()
	pickup, err := s.repo.FindByIDForCollector(tx, pickupID, collectorID)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, repository.ErrPickupNotFound) {
			return repository.ErrPickupNotFound
		}
		log.Printf("❌ [Complete] Failed to lock pickup %s: %v\n", pickupID, err)
		return errors.New("failed to complete the order")
	}

	pickup.PlasticWeight = verification.PlasticWeight
	pickup.CardboardWeight = verification.CardboardWeight
	pickup.GlassWeight = verification.GlassWeight
	pickup.PhotoURL = verification.PhotoURL

	if err := s.repo.SubmitVerification(tx, pickup); err != nil {
		tx.Rollback()
		log.Printf("❌ [Complete] Failed to submit verification %s: %v\n", pickupID, err)
		return errors.New("failed to complete the order")
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("❌ [Complete] Failed to commit %s: %v\n", pickupID, err)
		return errors.New("failed to complete the order")
	}

	log.Printf("✅ [VERIFYING] Order %s weight submitted by Collector %d, awaiting resident confirmation\n", pickupID, collectorID)

	return nil
}

// ConfirmPickup confirms a pickup by its owning resident (ownership check in repo).
// Status update + karma transfer run in one transaction for consistency.
// Returns the karma granted so it can be shown to the resident.
func (s *pickupService) ConfirmPickup(pickupID string, userID uint) (int, error) {
	if pickupID == "" {
		return 0, errors.New("ID order tidak valid")
	}

	tx := s.repo.Begin()
	pickup, err := s.repo.FindByIDForUser(tx, pickupID, userID)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, repository.ErrPickupNotFound) {
			return 0, repository.ErrPickupNotFound
		}
		log.Printf("❌ [Confirm] Failed to lock pickup %s: %v\n", pickupID, err)
		return 0, errors.New("failed to confirm pickup")
	}

	// Karma computed from the per-material weight the collector weighed
	// (see calculateKarma — floor to 1 for small valid weight, fallback 5 for old data).
	karmaGained := calculateKarma(*pickup)

	pickup.Status = "COMPLETED"
	if err := s.repo.UpdateStatus(tx, pickup); err != nil {
		tx.Rollback()
		log.Printf("❌ [Confirm] Failed to update status %s: %v\n", pickupID, err)
		return 0, errors.New("failed to confirm pickup")
	}

	if err := s.repo.AddKarma(tx, pickup.UserID, karmaGained); err != nil {
		tx.Rollback()
		log.Printf("❌ [Confirm] Failed to transfer karma %s: %v\n", pickupID, err)
		return 0, errors.New("failed to confirm pickup")
	}

	// Collector earnings are computed from exactly the same weight as karma and
	// added in the SAME transaction, so both rewards are consistent (no pickup
	// grants karma without earnings or vice versa).
	if pickup.CollectorID != nil {
		earnings := calculateEarnings(*pickup)
		if err := s.repo.AddEarnings(tx, *pickup.CollectorID, earnings); err != nil {
			tx.Rollback()
			log.Printf("❌ [Confirm] Failed to transfer earnings %s: %v\n", pickupID, err)
			return 0, errors.New("failed to confirm pickup")
		}
		log.Printf("💰 [EARNINGS ENGINE] Order %s Confirmed | Collector %d +Rp%d\n", pickupID, *pickup.CollectorID, earnings)
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("❌ [Confirm] Failed to commit %s: %v\n", pickupID, err)
		return 0, errors.New("failed to confirm pickup")
	}

	log.Printf("✅ [KARMA ENGINE] Order %s Confirmed by User %d | +%d Karma\n", pickupID, userID, karmaGained)

	// Pin proof to IPFS async so the response is not blocked.
	go pinPickupToIPFS(s.repo, *pickup, karmaGained)

	return karmaGained, nil
}

// pinPickupToIPFS sends the transaction proof to IPFS async and stores its hash.
func pinPickupToIPFS(repo repository.PickupRepository, pickup models.Pickup, karma int) {
	payload := map[string]interface{}{
		"order_id":  pickup.ID,
		"user_id":   pickup.UserID,
		"action":    "Recycled Waste",
		"reward":    "+" + strconv.Itoa(karma) + " Karma",
		"timestamp": time.Now().Format(time.RFC3339),
		"platform":  "Pilah App Web 2.5",
	}

	hash, err := utils.PinJSONToIPFS(payload)
	if err != nil {
		log.Printf("⚠️ [WEB3 ERROR] Failed to pin to IPFS for Order %s: %v\n", pickup.ID, err)
		return
	}

	if err := repo.SaveIPFSHash(pickup.ID, hash); err != nil {
		log.Printf("⚠️ [WEB3 ERROR] Failed to save IPFS hash Order %s: %v\n", pickup.ID, err)
		return
	}

	log.Printf("🌐 [WEB3 SUCCESS] Order %s recorded on IPFS: ipfs://%s\n", pickup.ID, hash)
}