package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"size:100;not null;default:'Pahlawan Pilah'" json:"name"`
	Email       string         `gorm:"size:100;uniqueIndex;not null" json:"email"`
	Password    string         `gorm:"not null" json:"-"`
	Role        string         `gorm:"type:varchar(20);default:'user'" json:"role"`
	KarmaPoints int            `gorm:"default:0" json:"karma_points"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
