package services

import (
	"backend/internal/models"
	"backend/internal/repository"
	"errors"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// KarmaToRupiahRate is the simulated rate of 1 karma = Rp50 for the Tukar Cuan feature.
// Redeeming karma really does reduce the DB balance, but the "fund transfer" is
// only simulated (no real payment gateway) — made explicit to the user.
const KarmaToRupiahRate = 50

type AuthService interface {
	Register(user *models.User) error
	Login(email, password string) (string, *models.User, error)
	GetProfile(userID uint) (*models.User, error)
	UpdateProfile(userID uint, update ProfileUpdate) (*models.User, error)
	RedeemKarma(userID uint, amountKarma int) (int, error)
	RedeemEarnings(userID uint, amountRupiah int64) (int64, error)
}

// ProfileUpdate holds the profile fields a user may change. Empty fields are
// ignored (partial update) — they don't overwrite existing values.
type ProfileUpdate struct {
	Name              string
	VehicleType       string
	ServiceArea       string
	BankName          string
	BankAccountNumber string
}

type authService struct {
	repo      repository.UserRepository
	jwtSecret string
}

func NewAuthService(repo repository.UserRepository, secret string) AuthService {
	return &authService{repo: repo, jwtSecret: secret}
}

func (s *authService) Register(user *models.User) error {
	if user.Email == "" || user.Password == "" {
		return errors.New("email and password must not be empty")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to process password security")
	}
	user.Password = string(hashedPassword)

	return s.repo.Create(user)
}

// GetProfile returns the logged-in user's profile for UI sync.
// Maps to a safe error for the response (hides raw DB messages).
func (s *authService) GetProfile(userID uint) (*models.User, error) {
	user, err := s.repo.GetByID(userID)
	if err != nil {
		return nil, errors.New("user data not found")
	}
	return user, nil
}

// UpdateProfile partially updates the user's profile, then returns the latest
// profile. Empty fields in the request don't overwrite existing data.
func (s *authService) UpdateProfile(userID uint, update ProfileUpdate) (*models.User, error) {
	updates := make(map[string]interface{})
	if update.Name != "" {
		updates["name"] = update.Name
	}
	if update.VehicleType != "" {
		updates["vehicle_type"] = update.VehicleType
	}
	if update.ServiceArea != "" {
		updates["service_area"] = update.ServiceArea
	}
	if update.BankName != "" {
		updates["bank_name"] = update.BankName
	}
	if update.BankAccountNumber != "" {
		updates["bank_account_number"] = update.BankAccountNumber
	}

	if len(updates) == 0 {
		return nil, errors.New("no profile data was changed")
	}

	if err := s.repo.UpdateProfile(userID, updates); err != nil {
		return nil, errors.New("failed to update profile")
	}

	return s.repo.GetByID(userID)
}

func (s *authService) Login(email, password string) (string, *models.User, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return "", nil, errors.New("incorrect email or password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", nil, errors.New("incorrect email or password")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	t, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", nil, errors.New("failed to create access token")
	}

	return t, user, nil
}

// RedeemKarma converts a user's karma into simulated Rupiah. Karma balance is
// REALLY DECREASED in the database, within one transaction with a row lock
// (FOR UPDATE) to be race-safe. Returned value is the new balance.
func (s *authService) RedeemKarma(userID uint, amountKarma int) (int, error) {
	if amountKarma <= 0 {
		return 0, errors.New("invalid karma amount")
	}

	tx := s.repo.Begin()
	user, err := s.repo.GetUserByIDForUpdate(tx, userID)
	if err != nil {
		tx.Rollback()
		log.Printf("⚠️ [Redeem] Failed to lock user %d: %v\n", userID, err)
		return 0, errors.New("user data not found")
	}

	if user.KarmaPoints < amountKarma {
		tx.Rollback()
		return 0, errors.New("Not enough karma for this amount")
	}

	if err := s.repo.DeductKarma(tx, userID, amountKarma); err != nil {
		tx.Rollback()
		log.Printf("⚠️ [Redeem] Failed to deduct karma for user %d: %v\n", userID, err)
		return 0, errors.New("failed to withdraw karma")
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("⚠️ [Redeem] Failed to commit user %d: %v\n", userID, err)
		return 0, errors.New("failed to withdraw karma")
	}

	log.Printf("✅ [REDEEM] User %d withdrew %d karma | New balance: %d | Value Rp%d\n",
		userID, amountKarma, user.KarmaPoints-amountKarma, amountKarma*KarmaToRupiahRate)

	return user.KarmaPoints - amountKarma, nil
}

// RedeemEarnings withdraws a collector's earnings (Rupiah) to their payment method.
// Earnings balance is REALLY DECREASED in the database, within one transaction
// with a row lock (FOR UPDATE) — same pattern as RedeemKarma, except the value
// here is already Rupiah (no rate conversion).
func (s *authService) RedeemEarnings(userID uint, amountRupiah int64) (int64, error) {
	if amountRupiah <= 0 {
		return 0, errors.New("invalid withdrawal amount")
	}

	tx := s.repo.Begin()
	user, err := s.repo.GetUserByIDForUpdate(tx, userID)
	if err != nil {
		tx.Rollback()
		log.Printf("⚠️ [Redeem-Earnings] Failed to lock user %d: %v\n", userID, err)
		return 0, errors.New("user data not found")
	}

	if user.CollectorEarnings < amountRupiah {
		tx.Rollback()
		return 0, errors.New("Not enough earnings for this amount")
	}

	if err := s.repo.DeductEarnings(tx, userID, amountRupiah); err != nil {
		tx.Rollback()
		log.Printf("⚠️ [Redeem-Earnings] Failed to deduct earnings for user %d: %v\n", userID, err)
		return 0, errors.New("failed to withdraw earnings")
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		log.Printf("⚠️ [Redeem-Earnings] Failed to commit user %d: %v\n", userID, err)
		return 0, errors.New("failed to withdraw earnings")
	}

	log.Printf("✅ [REDEEM-EARNINGS] Collector %d withdrew Rp%d | New balance: Rp%d\n",
		userID, amountRupiah, user.CollectorEarnings-amountRupiah)

	return user.CollectorEarnings - amountRupiah, nil
}
