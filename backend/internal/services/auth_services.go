package services

import (
	"errors"
	"os"
	"time"

	"backend/internal/models"
	"backend/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(user *models.User) error
	Login(email, password string) (string, error)
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
		return errors.New("email dan password tidak boleh kosong")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("gagal memproses keamanan password")
	}
	user.Password = string(hashedPassword)

	return s.repo.Create(user)
}

func (s *authService) Login(email, password string) (string, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return "", errors.New("email atau password salah")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("email atau password salah")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = s.jwtSecret
	}

	t, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", errors.New("gagal membuat token akses")
	}

	return t, nil
}
