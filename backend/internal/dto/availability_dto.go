package dto

import "github.com/timebankingskill/backend/internal/models"

// AvailabilitySlotRequest represents a single availability slot in a request
type AvailabilitySlotRequest struct {
	DayOfWeek int    `json:"day_of_week" binding:"min=0,max=6"` // 0=Sunday, 6=Saturday
	StartTime string `json:"start_time" binding:"required"`     // Format: "09:00"
	EndTime   string `json:"end_time" binding:"required"`       // Format: "17:00"
}

// SetAvailabilityRequest represents a request to set user's availability
type SetAvailabilityRequest struct {
	Slots []AvailabilitySlotRequest `json:"slots" binding:"required"`
}

// AvailabilityResponse represents an availability slot in API responses
type AvailabilityResponse struct {
	ID        uint   `json:"id"`
	DayOfWeek int    `json:"day_of_week"`
	DayName   string `json:"day_name"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	IsActive  bool   `json:"is_active"`
}

// UserAvailabilityResponse represents a user's full availability
type UserAvailabilityResponse struct {
	UserID       uint                   `json:"user_id"`
	Availability []AvailabilityResponse `json:"availability"`
}

// MapAvailabilityToResponse maps a model to response DTO
func MapAvailabilityToResponse(a *models.Availability) AvailabilityResponse {
	return AvailabilityResponse{
		ID:        a.ID,
		DayOfWeek: a.DayOfWeek,
		DayName:   a.DayName(),
		StartTime: a.StartTime,
		EndTime:   a.EndTime,
		IsActive:  a.IsActive,
	}
}

// MapAvailabilitiesToResponse maps multiple models to response DTOs
func MapAvailabilitiesToResponse(availabilities []models.Availability) []AvailabilityResponse {
	responses := make([]AvailabilityResponse, len(availabilities))
	for i, a := range availabilities {
		responses[i] = MapAvailabilityToResponse(&a)
	}
	return responses
}

// MapRequestToAvailabilities maps request to models
func MapRequestToAvailabilities(userID uint, req *SetAvailabilityRequest) []models.Availability {
	availabilities := make([]models.Availability, len(req.Slots))
	for i, slot := range req.Slots {
		availabilities[i] = models.Availability{
			UserID:    userID,
			DayOfWeek: slot.DayOfWeek,
			StartTime: slot.StartTime,
			EndTime:   slot.EndTime,
			IsActive:  true,
		}
	}
	return availabilities
}
