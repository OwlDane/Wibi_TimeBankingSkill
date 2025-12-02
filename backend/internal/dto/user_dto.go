package dto

import (
	"time"

	"github.com/timebankingskill/backend/internal/models"
)

// User Profile DTOs

type UpdateProfileRequest struct {
	FullName    string `json:"full_name"`
	Username    string `json:"username"`
	School      string `json:"school"`
	Grade       string `json:"grade"`
	Major       string `json:"major"`
	Bio         string `json:"bio"`
	PhoneNumber string `json:"phone_number"`
	Location    string `json:"location"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required"`
}

type UpdateAvatarRequest struct {
	Avatar string `json:"avatar" binding:"required"`
}

type UserProfileResponse struct {
	ID          uint      `json:"id"`
	FullName    string    `json:"full_name"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	School      string    `json:"school"`
	Grade       string    `json:"grade"`
	Major       string    `json:"major"`
	Bio         string    `json:"bio"`
	Avatar      string    `json:"avatar"`
	PhoneNumber string    `json:"phone_number"`
	Location    string    `json:"location"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PublicProfileResponse struct {
	ID                    uint      `json:"id"`
	FullName             string    `json:"full_name"`
	Username             string    `json:"username"`
	School               string    `json:"school"`
	Grade                string    `json:"grade"`
	Major                string    `json:"major"`
	Bio                  string    `json:"bio"`
	Avatar               string    `json:"avatar"`
	Location             string    `json:"location"`
	TotalSessionsAsTeacher int       `json:"total_sessions_as_teacher"`
	AverageRatingAsTeacher float64   `json:"average_rating_as_teacher"`
	TotalTeachingHours   float64   `json:"total_teaching_hours"`
	CreatedAt            time.Time `json:"created_at"`
}

type UserStatsResponse struct {
	CreditBalance         int     `json:"credit_balance"`
	TotalCreditsEarned   int     `json:"total_credits_earned"`
	TotalCreditsSpent    int     `json:"total_credits_spent"`
	TotalSessionsAsTeacher int     `json:"total_sessions_as_teacher"`
	TotalSessionsAsStudent int     `json:"total_sessions_as_student"`
	AverageRatingAsTeacher float64 `json:"average_rating_as_teacher"`
	AverageRatingAsStudent float64 `json:"average_rating_as_student"`
	TotalTeachingHours   float64 `json:"total_teaching_hours"`
	TotalLearningHours   float64 `json:"total_learning_hours"`
}

// Helper functions for conversion

func ToUserProfileResponse(user *models.User) UserProfileResponse {
	return UserProfileResponse{
		ID:          user.ID,
		FullName:    user.FullName,
		Username:    user.Username,
		Email:       user.Email,
		School:      user.School,
		Grade:       user.Grade,
		Major:       user.Major,
		Bio:         user.Bio,
		Avatar:      user.Avatar,
		PhoneNumber: user.PhoneNumber,
		Location:    user.Location,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}