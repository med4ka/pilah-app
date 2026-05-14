package services

import (
	"errors"
	"time"

	"backend/internal/models" // Sesuaikan nama modul
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
	// Validasi dasar
	if user.Email == "" || user.Password == "" {
		return errors.New("email dan password tidak boleh kosong")
	}

	// CONSTRAINTS CHECK: Hash Password sebelum masuk DB! (Security 100%)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("gagal memproses keamanan password")
	}
	user.Password = string(hashedPassword)

	// Simpan ke database via Repository
	return s.repo.Create(user)
}

func (s *authService) Login(email, password string) (string, error) {
	// 1. Cari user berdasarkan email
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return "", errors.New("email atau password salah") // Jangan pernah beri tahu hacker letak kesalahannya di email atau password
	}

	// 2. Cek kecocokan hash password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("email atau password salah")
	}

	// 3. Generate JWT Token untuk otentikasi UI/UX
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(), // Token mati dalam 3 hari
	})

	t, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", errors.New("gagal membuat token akses")
	}

	return t, nil
}
