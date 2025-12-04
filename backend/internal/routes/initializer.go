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
func InitializeUserHandler(db *gorm.DB) *handler.UserHandler {
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	return handler.NewUserHandler(userService)
}

// InitializeTransactionHandler initializes transaction handler with dependencies
func InitializeTransactionHandler(db *gorm.DB) *handler.TransactionHandler {
	transactionRepo := repository.NewTransactionRepository(db)
	userRepo := repository.NewUserRepository(db)
	transactionService := service.NewTransactionService(transactionRepo, userRepo)
	return handler.NewTransactionHandler(transactionService)
}

// InitializeSessionHandler initializes session handler with dependencies
func InitializeSessionHandler(db *gorm.DB) *handler.SessionHandler {
	sessionRepo := repository.NewSessionRepository(db)
	userRepo := repository.NewUserRepository(db)
	skillRepo := repository.NewSkillRepository(db)
	transactionRepo := repository.NewTransactionRepository(db)
	sessionService := service.NewSessionService(sessionRepo, userRepo, skillRepo, transactionRepo)
	return handler.NewSessionHandler(sessionService)
}
