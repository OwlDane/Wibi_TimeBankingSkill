package service

import (
	"errors"
	"fmt"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// EndorsementService handles endorsement business logic
type EndorsementService struct {
	endorsementRepo *repository.EndorsementRepository
	userRepo        *repository.UserRepository
	skillRepo       *repository.SkillRepository
}

// NewEndorsementService creates a new endorsement service
func NewEndorsementService(
	endorsementRepo *repository.EndorsementRepository,
	userRepo *repository.UserRepository,
	skillRepo *repository.SkillRepository,
) *EndorsementService {
	return &EndorsementService{
		endorsementRepo: endorsementRepo,
		userRepo:        userRepo,
		skillRepo:       skillRepo,
	}
}

// CreateEndorsement creates a new endorsement
func (s *EndorsementService) CreateEndorsement(endorserID uint, req *dto.CreateEndorsementRequest) (*models.Endorsement, error) {
	// Validate endorser exists
	_, err := s.userRepo.FindByID(endorserID)
	if err != nil {
		return nil, errors.New("endorser not found")
	}

	// Validate user exists
	_, err = s.userRepo.FindByID(req.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Validate skill exists
	_, err = s.skillRepo.GetByID(req.SkillID)
	if err != nil {
		return nil, errors.New("skill not found")
	}

	// Check if already endorsed
	hasEndorsed, err := s.endorsementRepo.HasEndorsed(endorserID, req.UserID, req.SkillID)
	if err != nil {
		return nil, fmt.Errorf("failed to check endorsement: %w", err)
	}
	if hasEndorsed {
		return nil, errors.New("already endorsed this skill")
	}

	endorsement := &models.Endorsement{
		UserID:    req.UserID,
		SkillID:   req.SkillID,
		EndorserID: endorserID,
		Message:   req.Message,
	}

	if err := s.endorsementRepo.CreateEndorsement(endorsement); err != nil {
		return nil, fmt.Errorf("failed to create endorsement: %w", err)
	}

	return s.endorsementRepo.GetEndorsementByID(endorsement.ID)
}

// GetEndorsementsForUser gets all endorsements for a user
func (s *EndorsementService) GetEndorsementsForUser(userID uint, limit, offset int) ([]models.Endorsement, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.endorsementRepo.GetEndorsementsForUser(userID, limit, offset)
}

// GetEndorsementsForSkill gets endorsements for a specific skill
func (s *EndorsementService) GetEndorsementsForSkill(userID, skillID uint, limit, offset int) ([]models.Endorsement, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.endorsementRepo.GetEndorsementsForSkill(userID, skillID, limit, offset)
}

// GetEndorsementCount gets count of endorsements for a skill
func (s *EndorsementService) GetEndorsementCount(userID, skillID uint) (int64, error) {
	return s.endorsementRepo.GetEndorsementCount(userID, skillID)
}

// DeleteEndorsement deletes an endorsement
func (s *EndorsementService) DeleteEndorsement(endorsementID, endorserID uint) error {
	// Get endorsement to check authorization
	endorsement, err := s.endorsementRepo.GetEndorsementByID(endorsementID)
	if err != nil {
		return errors.New("endorsement not found")
	}

	// Check authorization
	if endorsement.EndorserID != endorserID {
		return errors.New("unauthorized")
	}

	return s.endorsementRepo.DeleteEndorsement(endorsementID)
}

// GetTopEndorsedSkills gets the most endorsed skills
func (s *EndorsementService) GetTopEndorsedSkills(limit int) ([]map[string]interface{}, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}

	return s.endorsementRepo.GetTopEndorsedSkills(limit)
}
