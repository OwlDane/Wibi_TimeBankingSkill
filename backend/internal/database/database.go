package database

import (
	"fmt"
	"log"

	"github.com/timebankingskill/backend/internal/config"
	// "github.com/timebankingskill/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global database instance
var DB *gorm.DB

// Connect establishes database connection
func Connect(cfg *config.DatabaseConfig) error {
	dsn := cfg.GetDSN()

	// Configure GORM logger
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Set connection pool settings
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	// Assign to global variable
	DB = db

	log.Println("✅ Database connected successfully")
	return nil
}

// AutoMigrate runs database migrations
// func AutoMigrate() error {
// 	if DB == nil {
// 		return fmt.Errorf("database not connected")
// 	}

// 	log.Println("🔄 Running database migrations...")

// 	err := models.AutoMigrate(DB)
// 	if err != nil {
// 		return fmt.Errorf("failed to run migrations: %w", err)
// 	}

// 	log.Println("✅ Database migrations completed")
// 	return nil
// }

// // SeedInitialData seeds initial data (skills, badges, etc.)
// func SeedInitialData() error {
// 	if DB == nil {
// 		return fmt.Errorf("database not connected")
// 	}

// 	log.Println("🌱 Seeding initial data...")

// 	// Seed skills
// 	if err := seedSkills(); err != nil {
// 		return err
// 	}

// 	// Seed badges
// 	if err := seedBadges(); err != nil {
// 		return err
// 	}

// 	log.Println("✅ Initial data seeded successfully")
// 	return nil
// }

// // seedSkills creates initial skill categories
// func seedSkills() error {
// 	skills := []models.Skill{
// 		// Academic
// 		{Name: "Mathematics - Algebra", Category: models.CategoryAcademic, Description: "Basic to advanced algebra", Icon: "📐"},
// 		{Name: "Mathematics - Calculus", Category: models.CategoryAcademic, Description: "Differential and integral calculus", Icon: "📊"},
// 		{Name: "Physics", Category: models.CategoryAcademic, Description: "General physics concepts", Icon: "⚛️"},
// 		{Name: "Chemistry", Category: models.CategoryAcademic, Description: "Chemistry fundamentals", Icon: "🧪"},
// 		{Name: "Biology", Category: models.CategoryAcademic, Description: "Life sciences", Icon: "🧬"},

// 		// Technical
// 		{Name: "Web Development", Category: models.CategoryTechnical, Description: "HTML, CSS, JavaScript", Icon: "💻"},
// 		{Name: "Python Programming", Category: models.CategoryTechnical, Description: "Python basics to advanced", Icon: "🐍"},
// 		{Name: "Graphic Design - Canva", Category: models.CategoryTechnical, Description: "Design using Canva", Icon: "🎨"},
// 		{Name: "Video Editing", Category: models.CategoryTechnical, Description: "Video editing skills", Icon: "🎬"},

// 		// Language
// 		{Name: "English - Speaking", Category: models.CategoryLanguage, Description: "English conversation", Icon: "🗣️"},
// 		{Name: "English - Writing", Category: models.CategoryLanguage, Description: "English writing skills", Icon: "✍️"},
// 		{Name: "Japanese", Category: models.CategoryLanguage, Description: "Japanese language", Icon: "🇯🇵"},

// 		// Creative
// 		{Name: "Drawing", Category: models.CategoryCreative, Description: "Art and drawing", Icon: "🖌️"},
// 		{Name: "Music - Guitar", Category: models.CategoryCreative, Description: "Guitar playing", Icon: "🎸"},
// 		{Name: "Photography", Category: models.CategoryCreative, Description: "Photography basics", Icon: "📸"},

// 		// Sports
// 		{Name: "Basketball", Category: models.CategorySports, Description: "Basketball skills", Icon: "🏀"},
// 		{Name: "Swimming", Category: models.CategorySports, Description: "Swimming techniques", Icon: "🏊"},
// 	}

// 	for _, skill := range skills {
// 		// Check if skill already exists
// 		var existing models.Skill
// 		result := DB.Where("name = ?", skill.Name).First(&existing)
// 		if result.Error == gorm.ErrRecordNotFound {
// 			// Create new skill
// 			if err := DB.Create(&skill).Error; err != nil {
// 				return fmt.Errorf("failed to seed skill %s: %w", skill.Name, err)
// 			}
// 		}
// 	}

// 	return nil
// }

// // seedBadges creates initial achievement badges
// func seedBadges() error {
// 	badges := []models.Badge{
// 		{
// 			Name:         "Early Bird",
// 			Description:  "Completed your first session",
// 			Icon:         "🐣",
// 			Type:         models.BadgeTypeSpecial,
// 			Requirements: `{"sessions": 1}`,
// 			BonusCredits: 0.5,
// 			Rarity:       1,
// 			Color:        "#FFD700",
// 		},
// 		{
// 			Name:         "Quick Learner",
// 			Description:  "Completed 10 sessions as a student",
// 			Icon:         "📚",
// 			Type:         models.BadgeTypeMilestone,
// 			Requirements: `{"sessions_as_student": 10}`,
// 			BonusCredits: 1.0,
// 			Rarity:       2,
// 			Color:        "#4169E1",
// 		},
// 		{
// 			Name:         "Top Tutor",
// 			Description:  "Achieved 4.8+ rating with 20+ sessions",
// 			Icon:         "⭐",
// 			Type:         models.BadgeTypeQuality,
// 			Requirements: `{"rating": 4.8, "sessions": 20}`,
// 			BonusCredits: 2.0,
// 			Rarity:       4,
// 			Color:        "#FF6347",
// 		},
// 		{
// 			Name:         "Jack of All Trades",
// 			Description:  "Teach 5 different skills",
// 			Icon:         "🎭",
// 			Type:         models.BadgeTypeAchievement,
// 			Requirements: `{"unique_skills": 5}`,
// 			BonusCredits: 1.5,
// 			Rarity:       3,
// 			Color:        "#9370DB",
// 		},
// 		{
// 			Name:         "Time Banker",
// 			Description:  "Earned 50 total credits",
// 			Icon:         "💰",
// 			Type:         models.BadgeTypeMilestone,
// 			Requirements: `{"total_earned": 50}`,
// 			BonusCredits: 3.0,
// 			Rarity:       3,
// 			Color:        "#32CD32",
// 		},
// 		{
// 			Name:         "Dedicated Teacher",
// 			Description:  "Completed 50 sessions as a teacher",
// 			Icon:         "👨‍🏫",
// 			Type:         models.BadgeTypeMilestone,
// 			Requirements: `{"sessions_as_teacher": 50}`,
// 			BonusCredits: 2.5,
// 			Rarity:       4,
// 			Color:        "#FF8C00",
// 		},
// 	}

// 	for _, badge := range badges {
// 		// Check if badge already exists
// 		var existing models.Badge
// 		result := DB.Where("name = ?", badge.Name).First(&existing)
// 		if result.Error == gorm.ErrRecordNotFound {
// 			// Create new badge
// 			if err := DB.Create(&badge).Error; err != nil {
// 				return fmt.Errorf("failed to seed badge %s: %w", badge.Name, err)
// 			}
// 		}
// 	}

// 	return nil
// }

// Close closes database connection
func Close() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}
