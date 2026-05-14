package models

import "time"

type Pickup struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID      uint      `json:"user_id"`
	CollectorID *uint     `json:"collector_id" gorm:"index"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Status      string    `json:"status" gorm:"default:'PENDING'"`
	IPFSHash    string    `json:"ipfs_hash" gorm:"type:varchar(255)"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
