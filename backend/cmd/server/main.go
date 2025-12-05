package main

import (
  "fmt"
  "log"

  "github.com/gin-gonic/gin"
  "github.com/timebankingskill/backend/internal/config"
  "github.com/timebankingskill/backend/internal/database"
  "github.com/timebankingskill/backend/internal/middleware"
  "github.com/timebankingskill/backend/internal/routes"
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

  // Run migrations
  if err := database.AutoMigrate(); err != nil {
    log.Fatalf("❌ Failed to run migrations: %v", err)
  }

  // Seed initial data (skills, badges)
  if err := database.SeedInitialData(); err != nil {
    log.Printf("⚠️  Warning: Failed to seed data: %v", err)
  }

  // Initialize Gin router
  router := gin.New()

  // Apply middleware
  router.Use(middleware.Logger())
  router.Use(middleware.Recovery())
  router.Use(middleware.CORS())
  router.Use(middleware.ErrorHandler())
  // Rate limiting: 100 requests per minute per IP
  router.Use(middleware.RateLimitMiddleware(100))

  // Setup routes
  routes.SetupRoutes(router, database.DB)

  // Start server
  addr := fmt.Sprintf(":%s", cfg.Server.Port)
  log.Printf("🚀 Server starting on http://localhost%s", addr)
  log.Printf("📚 API Documentation: http://localhost%s/api/v1/health", addr)
  log.Printf("🔐 Auth endpoints: http://localhost%s/api/v1/auth", addr)

  if err := router.Run(addr); err != nil {
    log.Fatalf("❌ Failed to start server: %v", err)
  }
}
