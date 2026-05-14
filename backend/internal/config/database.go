package config

import (
	"fmt"
	"log"
	"time"

	"backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	// Idealnya ini pakai os.Getenv("DATABASE_URL"), tapi untuk dev kita hardcode dulu sesuai setup Anda
	dsn := "host=localhost user=postgres password=postgres dbname=pilah_db port=5432 sslmode=disable TimeZone=Asia/Jakarta"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Proper Logging aktif!
	})

	if err != nil {
		log.Fatal("Gagal konek ke database! \n", err)
	}

	// CONSTRAINTS CHECK: Database Connection Pooling untuk efisiensi server
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Gagal inisialisasi connection pool! \n", err)
	}

	sqlDB.SetMaxIdleConns(10)           // Maksimal koneksi nganggur
	sqlDB.SetMaxOpenConns(100)          // Maksimal koneksi jalan bersamaan
	sqlDB.SetConnMaxLifetime(time.Hour) // Tiap 1 jam koneksi di-refresh

	fmt.Println("Database Connected Successfully dengan Connection Pooling!")

	err = db.AutoMigrate(&models.User{}, &models.Pickup{})
	if err != nil {
		log.Fatal("Gagal AutoMigrate! \n", err)
	}

	DB = db
}
