package service

import (
	"time"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/repository"
)

// AnalyticsService handles analytics business logic
type AnalyticsService struct {
	userRepo        *repository.UserRepository
	sessionRepo     *repository.SessionRepository
	transactionRepo *repository.TransactionRepository
	reviewRepo      *repository.ReviewRepository
	skillRepo       *repository.SkillRepository
	badgeRepo       *repository.BadgeRepository
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(
	userRepo *repository.UserRepository,
	sessionRepo *repository.SessionRepository,
	transactionRepo *repository.TransactionRepository,
	reviewRepo *repository.ReviewRepository,
	skillRepo *repository.SkillRepository,
	badgeRepo *repository.BadgeRepository,
) *AnalyticsService {
	return &AnalyticsService{
		userRepo:        userRepo,
		sessionRepo:     sessionRepo,
		transactionRepo: transactionRepo,
		reviewRepo:      reviewRepo,
		skillRepo:       skillRepo,
		badgeRepo:       badgeRepo,
	}
}

// GetUserAnalytics gets analytics for a specific user
func (s *AnalyticsService) GetUserAnalytics(userID uint) (*dto.UserAnalyticsResponse, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	// Get session stats
	totalSessions, _ := s.sessionRepo.CountByUserID(userID)
	completedSessions, _ := s.sessionRepo.CountCompletedByUserID(userID)

	// Get credit stats
	totalEarned, _ := s.transactionRepo.GetTotalByType(userID, "earned")
	totalSpent, _ := s.transactionRepo.GetTotalByType(userID, "spent")
	balance := totalEarned - totalSpent

	// Get rating stats
	avgRating, _ := s.reviewRepo.GetAverageRating(userID)
	totalReviews, _ := s.reviewRepo.CountByUserID(userID)

	// Get badge stats
	totalBadges, _ := s.badgeRepo.CountUserBadges(userID)

	// Get skill stats
	skillsTeaching, _ := s.skillRepo.CountUserSkills(userID)
	skillsLearning, _ := s.skillRepo.CountLearningSkills(userID)

	return &dto.UserAnalyticsResponse{
		UserID:             user.ID,
		Username:           user.Username,
		TotalSessions:      totalSessions,
		CompletedSessions:  completedSessions,
		TotalCreditsEarned: totalEarned,
		TotalCreditsSpent:  totalSpent,
		CurrentBalance:     balance,
		AverageRating:      avgRating,
		TotalReviews:       totalReviews,
		TotalBadges:        totalBadges,
		TotalHoursTaught:   user.TeachingHours,
		TotalHoursLearned:  user.LearningHours,
		SkillsTeaching:     skillsTeaching,
		SkillsLearning:     skillsLearning,
		JoinedAt:           user.CreatedAt,
		LastActivityAt:     user.UpdatedAt,
	}, nil
}

// GetPlatformAnalytics gets platform-wide analytics
func (s *AnalyticsService) GetPlatformAnalytics() (*dto.PlatformAnalyticsResponse, error) {
	// Get user stats
	totalUsers, _ := s.userRepo.Count()
	activeUsers, _ := s.userRepo.CountActive(7) // Last 7 days

	// Get session stats
	totalSessions, _ := s.sessionRepo.Count()
	completedSessions, _ := s.sessionRepo.CountCompleted()

	// Get credit stats
	totalCredits, _ := s.transactionRepo.GetTotalCredits()

	// Get rating stats
	avgRating, _ := s.reviewRepo.GetPlatformAverageRating()

	// Get skill stats
	totalSkills, _ := s.skillRepo.Count()
	topSkills, _ := s.skillRepo.GetTopSkills(10)

	return &dto.PlatformAnalyticsResponse{
		TotalUsers:         totalUsers,
		ActiveUsers:        activeUsers,
		TotalSessions:      totalSessions,
		CompletedSessions:  completedSessions,
		TotalCreditsInFlow: totalCredits,
		AverageSessionRating: avgRating,
		TotalSkills:        totalSkills,
		TopSkills:          s.mapTopSkills(topSkills),
		UserGrowth:         s.generateUserGrowthTrend(),
		SessionTrend:       s.generateSessionTrend(),
		CreditFlow:         s.generateCreditFlowTrend(),
	}, nil
}

// GetSessionStatistics gets session statistics
func (s *AnalyticsService) GetSessionStatistics() (*dto.SessionStatistic, error) {
	total, _ := s.sessionRepo.Count()
	completed, _ := s.sessionRepo.CountCompleted()
	cancelled, _ := s.sessionRepo.CountCancelled()
	pending, _ := s.sessionRepo.CountPending()

	avgDuration, _ := s.sessionRepo.GetAverageDuration()
	avgRating, _ := s.reviewRepo.GetPlatformAverageRating()

	online, _ := s.sessionRepo.CountByMode("online")
	offline, _ := s.sessionRepo.CountByMode("offline")

	return &dto.SessionStatistic{
		TotalSessions:     total,
		CompletedSessions: completed,
		CancelledSessions: cancelled,
		PendingSessions:   pending,
		AverageDuration:   avgDuration,
		AverageRating:     avgRating,
		OnlineSessions:    online,
		OfflineSessions:   offline,
	}, nil
}

// GetCreditStatistics gets credit statistics
func (s *AnalyticsService) GetCreditStatistics() (*dto.CreditStatistic, error) {
	totalEarned, _ := s.transactionRepo.GetTotalByTypeGlobal("earned")
	totalSpent, _ := s.transactionRepo.GetTotalByTypeGlobal("spent")
	totalHeld, _ := s.transactionRepo.GetTotalByTypeGlobal("hold")

	avgEarned := totalEarned / 100 // Assume 100 users for average
	avgSpent := totalSpent / 100
	transactionCount, _ := s.transactionRepo.CountAll()

	return &dto.CreditStatistic{
		TotalEarned:      totalEarned,
		TotalSpent:       totalSpent,
		TotalHeld:        totalHeld,
		AverageEarned:    avgEarned,
		AverageSpent:     avgSpent,
		TransactionCount: transactionCount,
	}, nil
}

// Helper functions

func (s *AnalyticsService) mapTopSkills(skills interface{}) []dto.SkillStatistic {
	// Implementation depends on skill structure
	return []dto.SkillStatistic{}
}

func (s *AnalyticsService) generateUserGrowthTrend() []dto.DateStatistic {
	trend := make([]dto.DateStatistic, 0)
	now := time.Now()

	for i := 6; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)
		count, _ := s.userRepo.CountByDate(date)
		trend = append(trend, dto.DateStatistic{
			Date:  date.Format("2006-01-02"),
			Value: count,
		})
	}

	return trend
}

func (s *AnalyticsService) generateSessionTrend() []dto.DateStatistic {
	trend := make([]dto.DateStatistic, 0)
	now := time.Now()

	for i := 6; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)
		count, _ := s.sessionRepo.CountByDate(date)
		trend = append(trend, dto.DateStatistic{
			Date:  date.Format("2006-01-02"),
			Value: count,
		})
	}

	return trend
}

func (s *AnalyticsService) generateCreditFlowTrend() []dto.DateStatistic {
	trend := make([]dto.DateStatistic, 0)
	now := time.Now()

	for i := 6; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)
		amount, _ := s.transactionRepo.GetTotalByDate(date)
		trend = append(trend, dto.DateStatistic{
			Date:  date.Format("2006-01-02"),
			Value: amount,
		})
	}

	return trend
}
