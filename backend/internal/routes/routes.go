package routes

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/timebankingskill/backend/internal/config"
	"github.com/timebankingskill/backend/internal/middleware"
	"github.com/timebankingskill/backend/internal/models"
	whiteboardws "github.com/timebankingskill/backend/internal/websocket"
	"gorm.io/gorm"
)

// SetupRoutes configures all application routes
func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Initialize handlers
	authHandler := InitializeAuthHandler(db)
	adminHandler := InitializeAdminHandler(db)
	skillHandler := InitializeSkillHandler(db)
	userHandler := InitializeUserHandler(db)
	transactionHandler := InitializeTransactionHandler(db)
	sessionHandler := InitializeSessionHandler(db)
	reviewHandler := InitializeReviewHandler(db)
	badgeHandler := InitializeBadgeHandler(db)
	notificationHandler := InitializeNotificationHandler(db)
	forumHandler := InitializeForumHandler(db)
	storyHandler := InitializeStoryHandler(db)
	endorsementHandler := InitializeEndorsementHandler(db)
	videoSessionHandler := InitializeVideoSessionHandler(db, cfg)
	sharedFileHandler := InitializeSharedFileHandler(db)
	whiteboardHandler := InitializeWhiteboardHandler(db)
	progressHandler := InitializeSkillProgressHandler(db)
	analyticsHandler := InitializeAnalyticsHandler(db)

	// WebSocket endpoints (before auth middleware)
	router.GET("/api/v1/ws/whiteboard/:sessionId", func(c *gin.Context) {
		// Get user from context (set by auth middleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			return
		}

		userName, _ := c.Get("user_name")
		sessionIDStr := c.Param("sessionId")

		// Parse session ID
		var sessionID uint
		if _, err := fmt.Sscanf(sessionIDStr, "%d", &sessionID); err != nil {
			c.JSON(400, gin.H{"error": "Invalid session ID"})
			return
		}

		// Upgrade connection
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for now
			},
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}

		// Create mock user object
		user := &models.User{
			ID:       userID.(uint),
			FullName: userName.(string),
		}

		// Handle whiteboard connection
		whiteboardws.HandleWhiteboardConnection(conn, sessionID, user)
	})

	// Notification WebSocket endpoint
	notificationWS := InitializeNotificationWebSocket(db)
	router.GET("/api/v1/ws/notifications", notificationWS.HandleConnection)

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

		// Admin routes (public login, protected others)
		admin := v1.Group("/admin")
		{
			admin.POST("/login", adminHandler.Login)                                    // POST /api/v1/admin/login
			admin.POST("/register", adminHandler.Register)                              // POST /api/v1/admin/register (only super_admin)
			admin.GET("/profile", middleware.AuthMiddleware(), adminHandler.GetProfile) // GET /api/v1/admin/profile
			admin.PUT("/profile", middleware.AuthMiddleware(), adminHandler.UpdateProfile) // PUT /api/v1/admin/profile
			admin.POST("/change-password", middleware.AuthMiddleware(), adminHandler.ChangePassword) // POST /api/v1/admin/change-password
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

				// Video Session Management
				user.GET("/video-history", videoSessionHandler.GetVideoHistory)      // GET /api/v1/user/video-history
				user.GET("/video-stats", videoSessionHandler.GetVideoStats)          // GET /api/v1/user/video-stats
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

				// Video session routes
				sessions.POST("/:id/video/start", videoSessionHandler.StartVideoSession)     // POST /api/v1/sessions/:id/video/start
				sessions.GET("/:id/video/status", videoSessionHandler.GetVideoSessionStatus) // GET /api/v1/sessions/:id/video/status
				sessions.POST("/:id/video/end", videoSessionHandler.EndVideoSession)         // POST /api/v1/sessions/:id/video/end

				// File sharing routes
				sessions.POST("/:id/files/upload", sharedFileHandler.UploadFile)             // POST /api/v1/sessions/:id/files/upload
				sessions.GET("/:id/files", sharedFileHandler.GetSessionFiles)                // GET /api/v1/sessions/:id/files
				sessions.GET("/:id/files/stats", sharedFileHandler.GetSessionFileStats)      // GET /api/v1/sessions/:id/files/stats
				sessions.POST("/:id/files/download/:fileId", sharedFileHandler.GetFile)      // GET /api/v1/sessions/:id/files/:fileId

				// Whiteboard routes
				sessions.GET("/:id/whiteboard", whiteboardHandler.GetOrCreateWhiteboard)     // GET /api/v1/sessions/:id/whiteboard
				sessions.POST("/:id/whiteboard/save", whiteboardHandler.SaveDrawing)         // POST /api/v1/sessions/:id/whiteboard/save
				sessions.POST("/:id/whiteboard/clear", whiteboardHandler.ClearWhiteboard)    // POST /api/v1/sessions/:id/whiteboard/clear
				sessions.GET("/:id/whiteboard/data", whiteboardHandler.GetWhiteboard)        // GET /api/v1/sessions/:id/whiteboard/data
				sessions.DELETE("/:id/whiteboard", whiteboardHandler.DeleteWhiteboard)       // DELETE /api/v1/sessions/:id/whiteboard
			}

			// Progress Tracking routes
			progress := protected.Group("/user/skills")
			{
				progress.GET("/:skillId/progress", progressHandler.GetProgress)              // GET /api/v1/user/skills/:skillId/progress
				progress.PUT("/:skillId/progress", progressHandler.UpdateProgress)           // PUT /api/v1/user/skills/:skillId/progress
			}

			progressSummary := protected.Group("/user/progress")
			{
				progressSummary.GET("/summary", progressHandler.GetUserProgress)             // GET /api/v1/user/progress/summary
			}

			// Analytics routes
			analytics := protected.Group("/analytics")
			{
				analytics.GET("/user", analyticsHandler.GetUserAnalytics)                    // GET /api/v1/analytics/user
				analytics.GET("/user/:userId", analyticsHandler.GetUserAnalyticsByID)        // GET /api/v1/analytics/user/:userId
				analytics.GET("/platform", analyticsHandler.GetPlatformAnalytics)            // GET /api/v1/analytics/platform
				analytics.GET("/sessions", analyticsHandler.GetSessionStatistics)            // GET /api/v1/analytics/sessions
				analytics.GET("/credits", analyticsHandler.GetCreditStatistics)              // GET /api/v1/analytics/credits
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

			// Notifications routes
			notifications := protected.Group("/notifications")
			{
				notifications.GET("", notificationHandler.GetNotifications)                    // GET /api/v1/notifications
				notifications.GET("/unread", notificationHandler.GetUnreadNotifications)      // GET /api/v1/notifications/unread
				notifications.GET("/unread/count", notificationHandler.GetUnreadCount)        // GET /api/v1/notifications/unread/count
				notifications.GET("/type/:type", notificationHandler.GetNotificationsByType)  // GET /api/v1/notifications/type/session
				notifications.PUT("/:id/read", notificationHandler.MarkAsRead)                // PUT /api/v1/notifications/1/read
				notifications.PUT("/read-all", notificationHandler.MarkAllAsRead)             // PUT /api/v1/notifications/read-all
				notifications.DELETE("/:id", notificationHandler.DeleteNotification)          // DELETE /api/v1/notifications/1
			}

			// Forum routes
			forum := protected.Group("/forum")
			{
				forum.GET("/categories", forumHandler.GetCategories)                          // GET /api/v1/forum/categories
				forum.POST("/threads", forumHandler.CreateThread)                             // POST /api/v1/forum/threads
				forum.GET("/threads/:id", forumHandler.GetThread)                             // GET /api/v1/forum/threads/:id
				forum.GET("/categories/:id/threads", forumHandler.GetThreadsByCategory)       // GET /api/v1/forum/categories/:id/threads
				forum.PUT("/threads/:id", forumHandler.UpdateThread)                          // PUT /api/v1/forum/threads/:id
				forum.POST("/replies", forumHandler.CreateReply)                              // POST /api/v1/forum/replies
				forum.GET("/threads/:id/replies", forumHandler.GetReplies)                    // GET /api/v1/forum/threads/:id/replies
				forum.DELETE("/replies/:id", forumHandler.DeleteReply)                        // DELETE /api/v1/forum/replies/:id
			}

			// Stories routes
			stories := protected.Group("/stories")
			{
				stories.POST("", storyHandler.CreateStory)                                    // POST /api/v1/stories
				stories.GET("/published", storyHandler.GetPublishedStories)                   // GET /api/v1/stories/published (specific routes first)
				stories.GET("/user/:user_id", storyHandler.GetUserStories)                    // GET /api/v1/stories/user/:user_id
				stories.POST("/comments", storyHandler.CreateComment)                         // POST /api/v1/stories/comments
				stories.DELETE("/comments/:id", storyHandler.DeleteComment)                   // DELETE /api/v1/stories/comments/:id
				stories.GET("/:id", storyHandler.GetStory)                                    // GET /api/v1/stories/:id (generic routes last)
				stories.GET("/:id/comments", storyHandler.GetComments)                        // GET /api/v1/stories/:id/comments
				stories.PUT("/:id", storyHandler.UpdateStory)                                 // PUT /api/v1/stories/:id
				stories.DELETE("/:id", storyHandler.DeleteStory)                              // DELETE /api/v1/stories/:id
				stories.POST("/:id/like", storyHandler.LikeStory)                             // POST /api/v1/stories/:id/like
				stories.POST("/:id/unlike", storyHandler.UnlikeStory)                         // POST /api/v1/stories/:id/unlike
			}

			// Endorsements routes
			endorsements := protected.Group("/endorsements")
			{
				endorsements.POST("", endorsementHandler.CreateEndorsement)                   // POST /api/v1/endorsements
				endorsements.GET("/user/:user_id", endorsementHandler.GetEndorsementsForUser) // GET /api/v1/endorsements/user/:user_id
				endorsements.GET("/user/:user_id/skill/:skill_id", endorsementHandler.GetEndorsementsForSkill) // GET /api/v1/endorsements/user/:user_id/skill/:skill_id
				endorsements.GET("/count/:user_id/:skill_id", endorsementHandler.GetEndorsementCount)         // GET /api/v1/endorsements/count/:user_id/:skill_id
				endorsements.DELETE("/:id", endorsementHandler.DeleteEndorsement)             // DELETE /api/v1/endorsements/:id
				endorsements.GET("/top-skills", endorsementHandler.GetTopEndorsedSkills)      // GET /api/v1/endorsements/top-skills
			}
		}
	}
}
