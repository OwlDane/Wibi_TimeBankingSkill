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
      skills.GET("", skillHandler.GetSkills)              // GET /api/v1/skills?limit=10&page=1&category=&search=
      skills.GET("/:id", skillHandler.GetSkillByID)       // GET /api/v1/skills/1
    }

    // Public User profiles
    publicUsers := v1.Group("/users")
    {
      publicUsers.GET("/:id/profile", userHandler.GetPublicProfile)           // GET /api/v1/users/1/profile
      publicUsers.GET("/@:username", userHandler.GetPublicProfileByUsername)  // GET /api/v1/users/@johndoe
    }

    // Protected routes (require authentication)
    protected := v1.Group("")
    protected.Use(middleware.AuthMiddleware())
    {
      // User Profile Management
      user := protected.Group("/user")
      {
        user.GET("/profile", userHandler.GetProfile)           // GET /api/v1/user/profile
        user.PUT("/profile", userHandler.UpdateProfile)        // PUT /api/v1/user/profile
        user.POST("/change-password", userHandler.ChangePassword) // POST /api/v1/user/change-password
        user.GET("/stats", userHandler.GetStats)               // GET /api/v1/user/stats
        user.POST("/avatar", userHandler.UpdateAvatar)         // POST /api/v1/user/avatar
        
        // User Skills Management
        user.POST("/skills", skillHandler.AddUserSkill)           // POST /api/v1/user/skills
        user.GET("/skills", skillHandler.GetUserSkills)           // GET /api/v1/user/skills
        user.PUT("/skills/:skillId", skillHandler.UpdateUserSkill) // PUT /api/v1/user/skills/1
        user.DELETE("/skills/:skillId", skillHandler.DeleteUserSkill) // DELETE /api/v1/user/skills/1
        
        // Learning Skills Management
        user.POST("/learning-skills", skillHandler.AddLearningSkill)      // POST /api/v1/user/learning-skills
        user.GET("/learning-skills", skillHandler.GetLearningSkills)       // GET /api/v1/user/learning-skills
        user.DELETE("/learning-skills/:skillId", skillHandler.DeleteLearningSkill) // DELETE /api/v1/user/learning-skills/1
      }

      // Admin Skills Management (future: add admin middleware)
      adminSkills := protected.Group("/admin/skills")
      {
        adminSkills.POST("", skillHandler.CreateSkill)       // POST /api/v1/admin/skills
        adminSkills.PUT("/:id", skillHandler.UpdateSkill)    // PUT /api/v1/admin/skills/1
        adminSkills.DELETE("/:id", skillHandler.DeleteSkill) // DELETE /api/v1/admin/skills/1
      }

      // Future routes
      // Sessions routes will be added here
      // Reviews routes will be added here
    }
  }
}
