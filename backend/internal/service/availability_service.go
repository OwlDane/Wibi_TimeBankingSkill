package service

import (
	"errors"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/repository"
)

// AvailabilityService handles availability business logic
type AvailabilityService struct {
	availabilityRepo *repository.AvailabilityRepository
}

// NewAvailabilityService creates a new availability service
func NewAvailabilityService(availabilityRepo *repository.AvailabilityRepository) *AvailabilityService {
	return &AvailabilityService{
		availabilityRepo: availabilityRepo,
	}
}

// GetUserAvailability gets all availability slots for a user
func (s *AvailabilityService) GetUserAvailability(userID uint) (*dto.UserAvailabilityResponse, error) {
	availabilities, err := s.availabilityRepo.GetUserAvailability(userID)
	if err != nil {
		return nil, errors.New("failed to fetch availability")
	}

	return &dto.UserAvailabilityResponse{
		UserID:       userID,
		Availability: dto.MapAvailabilitiesToResponse(availabilities),
	}, nil
}

// SetUserAvailability sets the complete availability schedule for a user
// This replaces all existing availability with the new schedule
func (s *AvailabilityService) SetUserAvailability(userID uint, req *dto.SetAvailabilityRequest) (*dto.UserAvailabilityResponse, error) {
	// Validate time ranges
	for _, slot := range req.Slots {
		if slot.StartTime >= slot.EndTime {
			return nil, errors.New("start time must be before end time for all slots")
		}
		if slot.DayOfWeek < 0 || slot.DayOfWeek > 6 {
			return nil, errors.New("day_of_week must be between 0 (Sunday) and 6 (Saturday)")
		}
	}

	// Convert request to models
	availabilities := dto.MapRequestToAvailabilities(userID, req)

	// Set availability (replaces existing)
	if err := s.availabilityRepo.SetUserAvailability(userID, availabilities); err != nil {
		return nil, errors.New("failed to set availability")
	}

	// Fetch updated availability
	return s.GetUserAvailability(userID)
}

// GetAvailabilityByDay gets availability for a specific user on a specific day
func (s *AvailabilityService) GetAvailabilityByDay(userID uint, dayOfWeek int) ([]dto.AvailabilityResponse, error) {
	if dayOfWeek < 0 || dayOfWeek > 6 {
		return nil, errors.New("day_of_week must be between 0 (Sunday) and 6 (Saturday)")
	}

	availabilities, err := s.availabilityRepo.GetUserAvailabilityByDay(userID, dayOfWeek)
	if err != nil {
		return nil, errors.New("failed to fetch availability")
	}

	return dto.MapAvailabilitiesToResponse(availabilities), nil
}

// CheckUserAvailability checks if a user is available at a specific day and time
func (s *AvailabilityService) CheckUserAvailability(userID uint, dayOfWeek int, timeStr string) (bool, error) {
	if dayOfWeek < 0 || dayOfWeek > 6 {
		return false, errors.New("day_of_week must be between 0 (Sunday) and 6 (Saturday)")
	}

	return s.availabilityRepo.IsUserAvailable(userID, dayOfWeek, timeStr)
}

// ClearUserAvailability removes all availability for a user
func (s *AvailabilityService) ClearUserAvailability(userID uint) error {
	return s.availabilityRepo.DeleteUserAvailability(userID)
}
