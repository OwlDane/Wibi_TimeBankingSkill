package service

import (
	"errors"
	"math"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// SkillProgressService handles skill progress business logic
type SkillProgressService struct {
	progressRepo   *repository.SkillProgressRepository
	skillRepo      *repository.SkillRepository
	sessionRepo    *repository.SessionRepository
	notificationService *NotificationService
}

// NewSkillProgressService creates a new skill progress service
func NewSkillProgressService(
	progressRepo *repository.SkillProgressRepository,
	skillRepo *repository.SkillRepository,
	sessionRepo *repository.SessionRepository,
	notificationService *NotificationService,
) *SkillProgressService {
	return &SkillProgressService{
		progressRepo:   progressRepo,
		skillRepo:      skillRepo,
		sessionRepo:    sessionRepo,
		notificationService: notificationService,
	}
}

// GetProgress gets progress for a user's skill
func (s *SkillProgressService) GetProgress(userID, skillID uint) (*dto.SkillProgressResponse, error) {
	progress, err := s.progressRepo.GetByUserAndSkill(userID, skillID)
	if err != nil {
		return nil, err
	}

	// Get milestones
	milestones, err := s.progressRepo.GetMilestones(progress.ID)
	if err != nil {
		milestones = []models.Milestone{}
	}

	return s.mapToProgressResponse(progress, milestones), nil
}

// GetUserProgress gets all progress for a user
func (s *SkillProgressService) GetUserProgress(userID uint) (*dto.ProgressSummaryResponse, error) {
	progresses, err := s.progressRepo.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	avgProgress, _ := s.progressRepo.GetAverageProgress(userID)
	totalHours, _ := s.progressRepo.GetTotalHoursSpent(userID)

	responses := make([]dto.SkillProgressResponse, 0)
	for _, p := range progresses {
		milestones, _ := s.progressRepo.GetMilestones(p.ID)
		responses = append(responses, *s.mapToProgressResponse(&p, milestones))
	}

	return &dto.ProgressSummaryResponse{
		TotalSkillsLearning: len(progresses),
		AverageProgress:     avgProgress,
		TotalHoursSpent:     totalHours,
		SkillsProgresses:    responses,
	}, nil
}

// UpdateProgress updates user's skill progress
func (s *SkillProgressService) UpdateProgress(userID, skillID uint, req *dto.UpdateProgressRequest) (*dto.SkillProgressResponse, error) {
	progress, err := s.progressRepo.GetByUserAndSkill(userID, skillID)
	if err != nil {
		// Create new progress if doesn't exist
		_, err := s.skillRepo.GetByID(skillID)
		if err != nil {
			return nil, errors.New("skill not found")
		}

		progress = &models.SkillProgress{
			UserID:             userID,
			SkillID:            skillID,
			SessionsCompleted:  req.SessionsCompleted,
			TotalHoursSpent:    req.TotalHoursSpent,
			ProgressPercentage: s.calculateProgress(req.SessionsCompleted, req.TotalHoursSpent),
			CurrentLevel:       s.calculateLevel(req.TotalHoursSpent),
			LastActivityAt:     getCurrentTimestamp(),
		}

		if err := s.progressRepo.Create(progress); err != nil {
			return nil, err
		}
	} else {
		// Update existing progress
		progress.SessionsCompleted = req.SessionsCompleted
		progress.TotalHoursSpent = req.TotalHoursSpent
		progress.ProgressPercentage = s.calculateProgress(req.SessionsCompleted, req.TotalHoursSpent)
		progress.CurrentLevel = s.calculateLevel(req.TotalHoursSpent)
		progress.LastActivityAt = getCurrentTimestamp()

		// Update estimated completion
		progress.EstimatedCompletionAt = s.calculateEstimatedCompletion(progress.ProgressPercentage, progress.LastActivityAt)

		if err := s.progressRepo.Update(progress); err != nil {
			return nil, err
		}

		// Check and award milestones
		s.checkAndAwardMilestones(progress)
	}

	milestones, _ := s.progressRepo.GetMilestones(progress.ID)
	return s.mapToProgressResponse(progress, milestones), nil
}

// CreateMilestones creates default milestones for a skill
func (s *SkillProgressService) CreateMilestones(progressID uint) error {
	defaultMilestones := []models.Milestone{
		{
			SkillProgressID:   progressID,
			Title:             "Getting Started",
			Description:       "Complete your first session",
			ProgressThreshold: 10,
		},
		{
			SkillProgressID:   progressID,
			Title:             "Beginner",
			Description:       "Reach 25% progress",
			ProgressThreshold: 25,
		},
		{
			SkillProgressID:   progressID,
			Title:             "Intermediate",
			Description:       "Reach 50% progress",
			ProgressThreshold: 50,
		},
		{
			SkillProgressID:   progressID,
			Title:             "Advanced",
			Description:       "Reach 75% progress",
			ProgressThreshold: 75,
		},
		{
			SkillProgressID:   progressID,
			Title:             "Expert",
			Description:       "Reach 100% progress",
			ProgressThreshold: 100,
		},
	}

	for _, m := range defaultMilestones {
		if err := s.progressRepo.CreateMilestone(&m); err != nil {
			return err
		}
	}

	return nil
}

// Helper functions

func (s *SkillProgressService) calculateProgress(sessionsCompleted int, hoursSpent float64) float64 {
	// Progress = (sessions * 20) + (hours * 5), capped at 100
	progress := float64(sessionsCompleted)*20 + hoursSpent*5
	if progress > 100 {
		progress = 100
	}
	return math.Round(progress*100) / 100
}

func (s *SkillProgressService) calculateLevel(hoursSpent float64) string {
	if hoursSpent < 5 {
		return "beginner"
	} else if hoursSpent < 20 {
		return "intermediate"
	} else if hoursSpent < 50 {
		return "advanced"
	}
	return "expert"
}

func (s *SkillProgressService) calculateEstimatedCompletion(currentProgress float64, lastActivity int64) int64 {
	// Estimate based on current progress rate
	// Assume 10% progress per week
	remainingProgress := 100 - currentProgress
	weeksNeeded := remainingProgress / 10
	daysNeeded := int64(weeksNeeded * 7)
	return lastActivity + (daysNeeded * 24 * 60 * 60 * 1000)
}

func (s *SkillProgressService) checkAndAwardMilestones(progress *models.SkillProgress) {
	milestones, err := s.progressRepo.GetMilestones(progress.ID)
	if err != nil {
		return
	}

	for _, m := range milestones {
		if !m.IsAchieved && progress.ProgressPercentage >= m.ProgressThreshold {
			m.IsAchieved = true
			m.AchievedAt = getCurrentTimestamp()
			s.progressRepo.UpdateMilestone(&m)

			// Send notification
			skillName := ""
			if progress.Skill != nil {
				skillName = progress.Skill.Name
			}
			
			data := map[string]interface{}{
				"milestone_id": m.ID,
				"skill_id":     progress.SkillID,
			}
			
			s.notificationService.CreateNotification(
				progress.UserID,
				"achievement",
				"Milestone Achieved!",
				"You've achieved the '"+m.Title+"' milestone in "+skillName,
				data,
			)
		}
	}
}

func (s *SkillProgressService) mapToProgressResponse(progress *models.SkillProgress, milestones []models.Milestone) *dto.SkillProgressResponse {
	skillName := ""
	if progress.Skill != nil {
		skillName = progress.Skill.Name
	}

	milestoneResponses := make([]dto.MilestoneResponse, 0)
	for _, m := range milestones {
		milestoneResponses = append(milestoneResponses, dto.MilestoneResponse{
			ID:                m.ID,
			Title:             m.Title,
			Description:       m.Description,
			ProgressThreshold: m.ProgressThreshold,
			IsAchieved:        m.IsAchieved,
			AchievedAt:        m.AchievedAt,
			CreatedAt:         m.CreatedAt,
		})
	}

	return &dto.SkillProgressResponse{
		ID:                    progress.ID,
		UserID:                progress.UserID,
		SkillID:               progress.SkillID,
		SkillName:             skillName,
		ProgressPercentage:    progress.ProgressPercentage,
		SessionsCompleted:     progress.SessionsCompleted,
		TotalHoursSpent:       progress.TotalHoursSpent,
		CurrentLevel:          progress.CurrentLevel,
		LastActivityAt:        progress.LastActivityAt,
		EstimatedCompletionAt: progress.EstimatedCompletionAt,
		Milestones:            milestoneResponses,
		CreatedAt:             progress.CreatedAt,
		UpdatedAt:             progress.UpdatedAt,
	}
}

func getCurrentTimestamp() int64 {
	return int64(0) // Will be set by database
}
