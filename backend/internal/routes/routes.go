package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/middleware"
	"gorm.io/gorm"
)

// SetupRoutes configures all application routes
func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	// Initialize handlers
	authHandler := InitializeAuthHandler(db)
	skillHandler := InitializeSkillHandler(db)
	userHandler := InitializeUserHandler(db)
	transactionHandler := InitializeTransactionHandler(db)
	sessionHandler := InitializeSessionHandler(db)
	reviewHandler := InitializeReviewHandler(db)
	badgeHandler := InitializeBadgeHandler(db)

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "ok",
				"message": "Time Banking API v1 is running",
			})
		})

		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
			auth.GET("/profile", middleware.AuthMiddleware(), authHandler.GetProfile)
		}

		// Public Skills routes
		skills := v1.Group("/skills")
		{
			skills.GET("", skillHandler.GetSkills)                     // GET /api/v1/skills?limit=10&page=1&category=&search=
			skills.GET("/:id/teachers", skillHandler.GetSkillTeachers) // GET /api/v1/skills/1/teachers
			skills.GET("/:id", skillHandler.GetSkillByID)              // GET /api/v1/skills/1
		}

		// Public User profiles
		publicUsers := v1.Group("/users")
		{
			publicUsers.GET("/@:username", userHandler.GetPublicProfileByUsername) // GET /api/v1/users/@johndoe (must be before /:id)
			publicUsers.GET("/:id/profile", userHandler.GetPublicProfile)          // GET /api/v1/users/1/profile
			publicUsers.GET("/:id/reviews", reviewHandler.GetUserReviews)          // GET /api/v1/users/1/reviews
			publicUsers.GET("/:id/reviews/:type", reviewHandler.GetUserReviewsByType) // GET /api/v1/users/1/reviews/teacher
			publicUsers.GET("/:id/rating-summary", reviewHandler.GetUserRatingSummary) // GET /api/v1/users/1/rating-summary
		}

		// Public Badges
		badges := v1.Group("/badges")
		{
			badges.GET("", badgeHandler.GetAllBadges)           // GET /api/v1/badges
			badges.GET("/:id", badgeHandler.GetBadge)           // GET /api/v1/badges/1
		}

		// Public Leaderboards
		leaderboards := v1.Group("/leaderboard")
		{
			leaderboards.GET("/badges", badgeHandler.GetBadgeLeaderboard)       // GET /api/v1/leaderboard/badges
			leaderboards.GET("/rarity", badgeHandler.GetRarityLeaderboard)      // GET /api/v1/leaderboard/rarity
			leaderboards.GET("/sessions", badgeHandler.GetSessionLeaderboard)   // GET /api/v1/leaderboard/sessions
			leaderboards.GET("/rating", badgeHandler.GetRatingLeaderboard)      // GET /api/v1/leaderboard/rating
			leaderboards.GET("/credits", badgeHandler.GetCreditLeaderboard)     // GET /api/v1/leaderboard/credits
		}

		// Protected routes (require authentication)
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User Profile Management
			user := protected.Group("/user")
			{
				user.GET("/profile", userHandler.GetProfile)              // GET /api/v1/user/profile
				user.PUT("/profile", userHandler.UpdateProfile)           // PUT /api/v1/user/profile
				user.POST("/change-password", userHandler.ChangePassword) // POST /api/v1/user/change-password
				user.GET("/stats", userHandler.GetStats)                  // GET /api/v1/user/stats
				user.POST("/avatar", userHandler.UpdateAvatar)            // POST /api/v1/user/avatar

				// User Skills Management
				user.POST("/skills", skillHandler.AddUserSkill)               // POST /api/v1/user/skills
				user.GET("/skills", skillHandler.GetUserSkills)               // GET /api/v1/user/skills
				user.PUT("/skills/:skillId", skillHandler.UpdateUserSkill)    // PUT /api/v1/user/skills/1
				user.DELETE("/skills/:skillId", skillHandler.DeleteUserSkill) // DELETE /api/v1/user/skills/1

				// Learning Skills Management
				user.POST("/learning-skills", skillHandler.AddLearningSkill)               // POST /api/v1/user/learning-skills
				user.GET("/learning-skills", skillHandler.GetLearningSkills)               // GET /api/v1/user/learning-skills
				user.DELETE("/learning-skills/:skillId", skillHandler.DeleteLearningSkill) // DELETE /api/v1/user/learning-skills/1

				// Transaction Management
				user.GET("/transactions", transactionHandler.GetUserTransactions)    // GET /api/v1/user/transactions
				user.GET("/transactions/:id", transactionHandler.GetTransactionByID) // GET /api/v1/user/transactions/1
			}

			// Admin Skills Management (future: add admin middleware)
			adminSkills := protected.Group("/admin/skills")
			{
				adminSkills.POST("", skillHandler.CreateSkill)       // POST /api/v1/admin/skills
				adminSkills.PUT("/:id", skillHandler.UpdateSkill)    // PUT /api/v1/admin/skills/1
				adminSkills.DELETE("/:id", skillHandler.DeleteSkill) // DELETE /api/v1/admin/skills/1
			}

			// Sessions routes
			sessions := protected.Group("/sessions")
			{
				sessions.POST("", sessionHandler.BookSession)                    // POST /api/v1/sessions - Book a session
				sessions.GET("", sessionHandler.GetUserSessions)                 // GET /api/v1/sessions - Get user's sessions
				sessions.GET("/upcoming", sessionHandler.GetUpcomingSessions)    // GET /api/v1/sessions/upcoming
				sessions.GET("/pending", sessionHandler.GetPendingRequests)      // GET /api/v1/sessions/pending - Teacher's pending requests
				sessions.GET("/:id", sessionHandler.GetSession)                  // GET /api/v1/sessions/:id
				sessions.POST("/:id/approve", sessionHandler.ApproveSession)     // POST /api/v1/sessions/:id/approve
				sessions.POST("/:id/reject", sessionHandler.RejectSession)       // POST /api/v1/sessions/:id/reject
				sessions.POST("/:id/start", sessionHandler.StartSession)         // POST /api/v1/sessions/:id/start
				sessions.POST("/:id/complete", sessionHandler.ConfirmCompletion) // POST /api/v1/sessions/:id/complete
				sessions.POST("/:id/cancel", sessionHandler.CancelSession)       // POST /api/v1/sessions/:id/cancel
			}

			// Reviews routes
			reviews := protected.Group("/reviews")
			{
				reviews.POST("", reviewHandler.CreateReview)              // POST /api/v1/reviews - Create a review
				reviews.GET("/:id", reviewHandler.GetReview)              // GET /api/v1/reviews/:id - Get a review
				reviews.PUT("/:id", reviewHandler.UpdateReview)           // PUT /api/v1/reviews/:id - Update a review
				reviews.DELETE("/:id", reviewHandler.DeleteReview)        // DELETE /api/v1/reviews/:id - Delete a review
			}

			// User Badges routes
			userBadges := protected.Group("/user/badges")
			{
				userBadges.GET("", badgeHandler.GetUserBadges)                    // GET /api/v1/user/badges
				userBadges.GET("/:type", badgeHandler.GetUserBadgesByType)        // GET /api/v1/user/badges/achievement
				userBadges.POST("/check", badgeHandler.CheckAndAwardBadges)       // POST /api/v1/user/badges/check
				userBadges.POST("/:id/pin", badgeHandler.PinBadge)                // POST /api/v1/user/badges/1/pin
			}
		}
	}
}
