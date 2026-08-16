package models

import "time"

type Pickup struct {
	ID              string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID          uint      `json:"user_id"`
	CollectorID     *uint     `json:"collector_id" gorm:"index"`
	Latitude        float64   `json:"latitude"`
	Longitude       float64   `json:"longitude"`
	Status          string    `json:"status" gorm:"default:'PENDING'"`
	// Resident weight estimate (optional, reference for collectors).
	// NOT the karma source — karma is always computed from the actual weight the
	// collector submits (PlasticWeight/CardboardWeight/GlassWeight).
	EstPlasticWeight   float64   `json:"est_plastic_weight" gorm:"default:0"`
	EstCardboardWeight float64   `json:"est_cardboard_weight" gorm:"default:0"`
	EstGlassWeight     float64   `json:"est_glass_weight" gorm:"default:0"`
	PlasticWeight   float64   `json:"plastic_weight" gorm:"default:0"`
	CardboardWeight float64   `json:"cardboard_weight" gorm:"default:0"`
	GlassWeight     float64   `json:"glass_weight" gorm:"default:0"`
	PhotoURL        string    `json:"photo_url" gorm:"type:varchar(500)"`
	IPFSHash        string    `json:"ipfs_hash" gorm:"type:varchar(255)"`
	// Transient fields (not persisted, gorm:"-"): filled on-the-fly by the service
	// when returning history so the frontend shows correct numbers without
	// re-implementing the karma/earnings formula on the client (single source).
	KarmaEarned    int   `json:"karma_earned" gorm:"-"`
	EarningsEarned int64 `json:"earnings_earned" gorm:"-"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// PickupVerification is the weight + proof photo payload a collector submits
// when moving a pickup from ACCEPTED to VERIFYING.
type PickupVerification struct {
	PlasticWeight   float64 `json:"plastic_weight"`
	CardboardWeight float64 `json:"cardboard_weight"`
	GlassWeight     float64 `json:"glass_weight"`
	PhotoURL        string  `json:"photo_url"`
}
