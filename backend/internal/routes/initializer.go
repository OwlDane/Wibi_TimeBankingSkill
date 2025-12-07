package routes

import (
	"github.com/timebankingskill/backend/internal/handler"
	"github.com/timebankingskill/backend/internal/repository"
	"github.com/timebankingskill/backend/internal/service"
	"gorm.io/gorm"
)

// InitializeAuthHandler initializes auth handler with dependencies
func InitializeAuthHandler(db *gorm.DB) *handler.AuthHandler {
	userRepo := repository.NewUserRepository(db)
	transactionRepo := repository.NewTransactionRepository(db)
	authService := service.NewAuthService(userRepo, transactionRepo)
	return handler.NewAuthHandler(authService)
}

// InitializeSkillHandler initializes skill handler with dependencies
func InitializeSkillHandler(db *gorm.DB) *handler.SkillHandler {
	skillRepo := repository.NewSkillRepository(db)
	userRepo := repository.NewUserRepository(db)
	skillService := service.NewSkillService(skillRepo, userRepo)
	return handler.NewSkillHandler(skillService)
}

// InitializeUserHandler initializes user handler with dependencies
// Includes session repository for calculating teaching/learning hours
func InitializeUserHandler(db *gorm.DB) *handler.UserHandler {
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	userService := service.NewUserServiceWithSession(userRepo, sessionRepo)
	return handler.NewUserHandler(userService)
}

// InitializeTransactionHandler initializes transaction handler with dependencies
func InitializeTransactionHandler(db *gorm.DB) *handler.TransactionHandler {
	transactionRepo := repository.NewTransactionRepository(db)
	userRepo := repository.NewUserRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)
	notificationService := service.NewNotificationService(notificationRepo, userRepo)
	transactionService := service.NewTransactionService(transactionRepo, userRepo, notificationService)
	return handler.NewTransactionHandler(transactionService)
}

// InitializeSessionHandler initializes session handler with dependencies
func InitializeSessionHandler(db *gorm.DB) *handler.SessionHandler {
	sessionRepo := repository.NewSessionRepository(db)
	userRepo := repository.NewUserRepository(db)
	skillRepo := repository.NewSkillRepository(db)
	transactionRepo := repository.NewTransactionRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)
	notificationService := service.NewNotificationService(notificationRepo, userRepo)
	sessionService := service.NewSessionService(sessionRepo, userRepo, skillRepo, transactionRepo, notificationService)
	return handler.NewSessionHandler(sessionService)
}

// InitializeReviewHandler initializes review handler with dependencies
func InitializeReviewHandler(db *gorm.DB) *handler.ReviewHandler {
	reviewRepo := repository.NewReviewRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	userRepo := repository.NewUserRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)
	notificationService := service.NewNotificationService(notificationRepo, userRepo)
	reviewService := service.NewReviewService(reviewRepo, sessionRepo, userRepo, notificationService)
	return handler.NewReviewHandler(reviewService)
}

// InitializeBadgeHandler initializes badge handler with dependencies
func InitializeBadgeHandler(db *gorm.DB) *handler.BadgeHandler {
	badgeRepo := repository.NewBadgeRepository(db)
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)
	notificationService := service.NewNotificationService(notificationRepo, userRepo)
	badgeService := service.NewBadgeService(badgeRepo, userRepo, sessionRepo, notificationService)
	return handler.NewBadgeHandler(badgeService)
}

// InitializeNotificationHandler initializes notification handler with dependencies
func InitializeNotificationHandler(db *gorm.DB) *handler.NotificationHandler {
	notificationRepo := repository.NewNotificationRepository(db)
	userRepo := repository.NewUserRepository(db)
	notificationService := service.NewNotificationService(notificationRepo, userRepo)
	return handler.NewNotificationHandler(notificationService)
}

// InitializeForumHandler initializes forum handler with dependencies
func InitializeForumHandler(db *gorm.DB) *handler.ForumHandler {
	forumRepo := repository.NewForumRepository(db)
	userRepo := repository.NewUserRepository(db)
	forumService := service.NewForumService(forumRepo, userRepo)
	return handler.NewForumHandler(forumService)
}

// InitializeStoryHandler initializes story handler with dependencies
func InitializeStoryHandler(db *gorm.DB) *handler.StoryHandler {
	storyRepo := repository.NewStoryRepository(db)
	userRepo := repository.NewUserRepository(db)
	storyService := service.NewStoryService(storyRepo, userRepo)
	return handler.NewStoryHandler(storyService)
}

// InitializeEndorsementHandler initializes endorsement handler with dependencies
func InitializeEndorsementHandler(db *gorm.DB) *handler.EndorsementHandler {
	endorsementRepo := repository.NewEndorsementRepository(db)
	userRepo := repository.NewUserRepository(db)
	skillRepo := repository.NewSkillRepository(db)
	endorsementService := service.NewEndorsementService(endorsementRepo, userRepo, skillRepo)
	return handler.NewEndorsementHandler(endorsementService)
}
