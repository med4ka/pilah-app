package config

import (
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
	// DB config read from environment — required, no hardcoded DSN.
	// Same pattern as JWT_SECRET: if anything is empty the server fails to start (fail-fast).
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	if dbHost == "" || dbUser == "" || dbPassword == "" || dbName == "" || dbPort == "" {
		log.Fatal("DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT must be set in the environment before the server runs")
	}

	dsn := "host=" + dbHost + " user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " port=" + dbPort + " sslmode=disable TimeZone=Asia/Jakarta"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database! \n", err)
	}

	// Connection pooling for server efficiency
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to initialize connection pool! \n", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database Connected Successfully with Connection Pooling!")

	err = db.AutoMigrate(&models.User{}, &models.Pickup{})
	if err != nil {
		log.Fatal("AutoMigrate failed! \n", err)
	}

	DB = db
}
