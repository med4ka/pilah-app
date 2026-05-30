package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Gagal konek ke database! \n", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Gagal inisialisasi connection pool! \n", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	fmt.Println("Database Connected Successfully dengan Connection Pooling!")

	err = db.AutoMigrate(&models.User{}, &models.Pickup{})
	if err != nil {
		log.Fatal("Gagal AutoMigrate! \n", err)
	}

	DB = db
}
