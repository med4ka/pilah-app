package repository

import (
	"backend/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserRepository interface {
	Create(user *models.User) error
	FindByEmail(email string) (*models.User, error)
	GetByID(id uint) (*models.User, error)
	UpdateProfile(id uint, updates map[string]interface{}) error

	// Transactions: Begin/Commit/Rollback orchestrated by the service; queries stay here.
	// Used to atomically reduce balance (row lock) when redeeming karma.
	Begin() *gorm.DB
	GetUserByIDForUpdate(tx *gorm.DB, userID uint) (*models.User, error)
	DeductKarma(tx *gorm.DB, userID uint, points int) error
	DeductEarnings(tx *gorm.DB, userID uint, amount int64) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db}
}

func (r *userRepo) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepo) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

// GetByID fetches a user by ID. Only the columns the Frontend needs are
// selected (password is never fetched here).
func (r *userRepo) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Select("id", "name", "email", "karma_points", "collector_earnings", "role", "vehicle_type", "service_area", "bank_name", "bank_account_number").Where("id = ?", id).First(&user).Error
	return &user, err
}

// UpdateProfile partially updates user profile fields — only columns present in
// the map are changed. GORM Updates with a map does not touch zero values not sent.
func (r *userRepo) UpdateProfile(id uint, updates map[string]interface{}) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error
}

func (r *userRepo) Begin() *gorm.DB {
	return r.db.Begin()
}

// GetUserByIDForUpdate fetches a user while locking its row (FOR UPDATE) inside
// a transaction — prevents a race when two redeem requests cut the same balance
// concurrently.
func (r *userRepo) GetUserByIDForUpdate(tx *gorm.DB, userID uint) (*models.User, error) {
	var user models.User
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id = ?", userID).
		First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) DeductKarma(tx *gorm.DB, userID uint, points int) error {
	return tx.Model(&models.User{}).Where("id = ?", userID).Update("karma_points", gorm.Expr("karma_points - ?", points)).Error
}

func (r *userRepo) DeductEarnings(tx *gorm.DB, userID uint, amount int64) error {
	return tx.Model(&models.User{}).Where("id = ?", userID).Update("collector_earnings", gorm.Expr("collector_earnings - ?", amount)).Error
}
