package service

import (
	"errors"

	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
	"gorm.io/gorm"
)

type SkillService struct {
	skillRepo repository.SkillRepositoryInterface
	userRepo  repository.UserRepositoryInterface
}

func NewSkillService(skillRepo repository.SkillRepositoryInterface, userRepo repository.UserRepositoryInterface) *SkillService {
	return &SkillService{
		skillRepo: skillRepo,
		userRepo:  userRepo,
	}
}

// GetAllSkills retrieves all skills with pagination and filters
func (s *SkillService) GetAllSkills(limit, offset int, category, search string) ([]models.Skill, int64, error) {
	return s.skillRepo.GetAllWithFilters(limit, offset, category, search)
}

// GetSkillByID retrieves a skill by ID
func (s *SkillService) GetSkillByID(id uint) (*models.Skill, error) {
	return s.skillRepo.GetByID(id)
}

// CreateSkill creates a new skill (admin only)
func (s *SkillService) CreateSkill(skill *models.Skill) error {
	// Validate required fields
	if skill.Name == "" {
		return errors.New("skill name is required")
	}
	if skill.Category == "" {
		return errors.New("skill category is required")
	}

	return s.skillRepo.Create(skill)
}

// UpdateSkill updates an existing skill (admin only)
func (s *SkillService) UpdateSkill(id uint, updates *models.Skill) error {
	// Check if skill exists
	existingSkill, err := s.skillRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("skill not found")
		}
		return err
	}

	// Update fields
	if updates.Name != "" {
		existingSkill.Name = updates.Name
	}
	if updates.Category != "" {
		existingSkill.Category = updates.Category
	}
	if updates.Description != "" {
		existingSkill.Description = updates.Description
	}
	if updates.Icon != "" {
		existingSkill.Icon = updates.Icon
	}

	return s.skillRepo.Update(existingSkill)
}

// DeleteSkill deletes a skill (admin only)
func (s *SkillService) DeleteSkill(id uint) error {
	// Check if skill exists
	_, err := s.skillRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("skill not found")
		}
		return err
	}

	return s.skillRepo.Delete(id)
}

// User Skills Management

// AddUserSkill adds a skill that user can teach
func (s *SkillService) AddUserSkill(userID uint, userSkill *models.UserSkill) error {
	// Validate user exists
	_, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// Validate skill exists
	_, err = s.skillRepo.GetByID(userSkill.SkillID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("skill not found")
		}
		return err
	}

	// Set user ID
	userSkill.UserID = userID

	// Validate required fields
	if userSkill.Level == "" {
		return errors.New("skill level is required")
	}
	if userSkill.HourlyRate < 0 {
		return errors.New("hourly rate must be non-negative")
	}

	// Check if user already has this skill
	existing, _ := s.skillRepo.GetUserSkill(userID, userSkill.SkillID)
	if existing != nil {
		return errors.New("user already has this skill")
	}

	return s.skillRepo.CreateUserSkill(userSkill)
}

// GetUserSkills retrieves all skills that user can teach
func (s *SkillService) GetUserSkills(userID uint) ([]models.UserSkill, error) {
	return s.skillRepo.GetUserSkills(userID)
}

// UpdateUserSkill updates user's skill details
func (s *SkillService) UpdateUserSkill(userID uint, skillID uint, updates *models.UserSkill) error {
	// Get existing user skill
	existing, err := s.skillRepo.GetUserSkill(userID, skillID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user skill not found")
		}
		return err
	}

	// Update fields
	if updates.Level != "" {
		existing.Level = updates.Level
	}
	if updates.Description != "" {
		existing.Description = updates.Description
	}
	if updates.YearsOfExperience >= 0 {
		existing.YearsOfExperience = updates.YearsOfExperience
	}
	if updates.ProofURL != "" {
		existing.ProofURL = updates.ProofURL
	}
	if updates.ProofType != "" {
		existing.ProofType = updates.ProofType
	}
	if updates.HourlyRate >= 0 {
		existing.HourlyRate = updates.HourlyRate
	}
	existing.OnlineOnly = updates.OnlineOnly
	existing.OfflineOnly = updates.OfflineOnly
	existing.IsAvailable = updates.IsAvailable

	return s.skillRepo.UpdateUserSkill(existing)
}

// DeleteUserSkill removes a skill from user's teaching skills
func (s *SkillService) DeleteUserSkill(userID uint, skillID uint) error {
	// Check if user skill exists
	_, err := s.skillRepo.GetUserSkill(userID, skillID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user skill not found")
		}
		return err
	}

	return s.skillRepo.DeleteUserSkill(userID, skillID)
}

// Learning Skills Management

// AddLearningSkill adds a skill to user's learning wishlist
func (s *SkillService) AddLearningSkill(userID uint, learningSkill *models.LearningSkill) error {
	// Validate user exists
	_, err := s.userRepo.GetByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// Validate skill exists
	_, err = s.skillRepo.GetByID(learningSkill.SkillID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("skill not found")
		}
		return err
	}

	// Set user ID
	learningSkill.UserID = userID

	// Check if user already wants to learn this skill
	existing, _ := s.skillRepo.GetLearningSkill(userID, learningSkill.SkillID)
	if existing != nil {
		return errors.New("skill already in learning wishlist")
	}

	return s.skillRepo.CreateLearningSkill(learningSkill)
}

// GetLearningSkills retrieves user's learning wishlist
func (s *SkillService) GetLearningSkills(userID uint) ([]models.LearningSkill, error) {
	return s.skillRepo.GetLearningSkills(userID)
}

// DeleteLearningSkill removes a skill from learning wishlist
func (s *SkillService) DeleteLearningSkill(userID uint, skillID uint) error {
	// Check if learning skill exists
	_, err := s.skillRepo.GetLearningSkill(userID, skillID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("learning skill not found")
		}
		return err
	}

	return s.skillRepo.DeleteLearningSkill(userID, skillID)
}
