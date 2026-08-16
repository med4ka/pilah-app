package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID uint `gorm:"primaryKey" json:"id"`
	// Default value so legacy rows stay valid when this field is added
	Name        string         `gorm:"size:100;not null;default:'Pahlawan Pilah'" json:"name"`
	Email       string         `gorm:"size:100;uniqueIndex;not null" json:"email"`
	Password    string         `gorm:"not null" json:"-"`
	Role        string         `gorm:"type:varchar(20);default:'user'" json:"role"`
	KarmaPoints int            `gorm:"default:0" json:"karma_points"`
	// Collector income (pickup results) in Rupiah. Default 0 so residents
	// (role user) are unaffected.
	CollectorEarnings int64 `gorm:"default:0" json:"collector_earnings"`
	// Partner (collector) profile. Default empty so residents are unaffected.
	VehicleType       string `gorm:"size:50;default:''" json:"vehicle_type"`
	ServiceArea       string `gorm:"size:100;default:''" json:"service_area"`
	BankName          string `gorm:"size:50;default:''" json:"bank_name"`
	BankAccountNumber string `gorm:"size:50;default:''" json:"bank_account_number"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
