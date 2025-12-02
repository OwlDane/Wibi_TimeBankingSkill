package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/config"
	"github.com/timebankingskill/backend/internal/database"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Connect to database
	if err := database.Connect(&cfg.Database); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()

	// // Run migrations
	// if err := database.AutoMigrate(); err != nil {
	// 	log.Fatalf("❌ Failed to run migrations: %v", err)
	// }

	// // Seed initial data (skills, badges)
	// if err := database.SeedInitialData(); err != nil {
	// 	log.Printf("⚠️  Warning: Failed to seed data: %v", err)
	// }

	// Initialize Gin router
	router := gin.Default()

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Time Banking API is running",
		})
	})

	// API v1 routes will be added here
	// v1 := router.Group("/api/v1")
	// {
	//     // Routes will be added in next steps
	// }

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Server starting on http://localhost%s", addr)
	log.Printf("📚 API Documentation: http://localhost%s/health", addr)

	if err := router.Run(addr); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
