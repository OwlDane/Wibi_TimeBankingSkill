package dto

import (
	"github.com/timebankingskill/backend/internal/models"
	"time"
)

// Skill DTOs

type CreateSkillRequest struct {
	Name        string `json:"name" binding:"required"`
	Category    string `json:"category" binding:"required"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

type UpdateSkillRequest struct {
	Name        string `json:"name"`
	Category    string `json:"category"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

type SkillResponse struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Category       string `json:"category"`
	Description    string `json:"description"`
	Icon           string `json:"icon"`
	TotalTeachers  int    `json:"total_teachers"`
	TotalLearners  int    `json:"total_learners"`
	CreatedAt      time.Time `json:"created_at"`
}

type SkillListResponse struct {
	Skills []SkillResponse `json:"skills"`
	Total  int64           `json:"total"`
	Page   int             `json:"page"`
	Limit  int             `json:"limit"`
}

// User Skill DTOs

type CreateUserSkillRequest struct {
	SkillID             uint    `json:"skill_id" binding:"required"`
	Level               string  `json:"level" binding:"required"`
	Description         string  `json:"description"`
	YearsOfExperience   int     `json:"years_of_experience"`
	ProofURL            string  `json:"proof_url"`
	ProofType           string  `json:"proof_type"`
	HourlyRate          float64 `json:"hourly_rate"`
	OnlineOnly          bool    `json:"online_only"`
	OfflineOnly         bool    `json:"offline_only"`
	IsAvailable         bool    `json:"is_available"`
}

type UpdateUserSkillRequest struct {
	Level               string  `json:"level"`
	Description         string  `json:"description"`
	YearsOfExperience   int     `json:"years_of_experience"`
	ProofURL            string  `json:"proof_url"`
	ProofType           string  `json:"proof_type"`
	HourlyRate          float64 `json:"hourly_rate"`
	OnlineOnly          bool    `json:"online_only"`
	OfflineOnly         bool    `json:"offline_only"`
	IsAvailable         *bool   `json:"is_available"`
}

type UserSkillResponse struct {
	ID                uint          `json:"id"`
	UserID            uint          `json:"user_id"`
	SkillID           uint          `json:"skill_id"`
	Skill             SkillResponse `json:"skill"`
	Level             string        `json:"level"`
	Description       string        `json:"description"`
	YearsOfExperience int           `json:"years_of_experience"`
	ProofURL          string        `json:"proof_url"`
	ProofType         string        `json:"proof_type"`
	HourlyRate        float64       `json:"hourly_rate"`
	OnlineOnly        bool          `json:"online_only"`
	OfflineOnly       bool          `json:"offline_only"`
	IsAvailable       bool          `json:"is_available"`
	TotalSessions     int           `json:"total_sessions"`
	AverageRating     float64       `json:"average_rating"`
	TotalReviews      int           `json:"total_reviews"`
	CreatedAt         time.Time     `json:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at"`
}

// Learning Skill DTOs

type CreateLearningSkillRequest struct {
	SkillID      uint   `json:"skill_id" binding:"required"`
	DesiredLevel string `json:"desired_level"`
	Priority     int    `json:"priority"`
	Notes        string `json:"notes"`
}

type LearningSkillResponse struct {
	ID           uint          `json:"id"`
	UserID       uint          `json:"user_id"`
	SkillID      uint          `json:"skill_id"`
	Skill        SkillResponse `json:"skill"`
	DesiredLevel string        `json:"desired_level"`
	Priority     int           `json:"priority"`
	Notes        string        `json:"notes"`
	CreatedAt    time.Time     `json:"created_at"`
}

// Helper functions for conversion

func ToSkillResponse(skill *models.Skill) SkillResponse {
	return SkillResponse{
		ID:             skill.ID,
		Name:           skill.Name,
		Category:       string(skill.Category),
		Description:    skill.Description,
		Icon:           skill.Icon,
		TotalTeachers:  skill.TotalTeachers,
		TotalLearners:  skill.TotalLearners,
		CreatedAt:      skill.CreatedAt,
	}
}

func ToUserSkillResponse(userSkill *models.UserSkill) UserSkillResponse {
	response := UserSkillResponse{
		ID:                userSkill.ID,
		UserID:            userSkill.UserID,
		SkillID:           userSkill.SkillID,
		Level:             string(userSkill.Level),
		Description:       userSkill.Description,
		YearsOfExperience: userSkill.YearsOfExperience,
		ProofURL:          userSkill.ProofURL,
		ProofType:         userSkill.ProofType,
		HourlyRate:        userSkill.HourlyRate,
		OnlineOnly:        userSkill.OnlineOnly,
		OfflineOnly:       userSkill.OfflineOnly,
		IsAvailable:       userSkill.IsAvailable,
		TotalSessions:     userSkill.TotalSessions,
		AverageRating:     userSkill.AverageRating,
		TotalReviews:      userSkill.TotalReviews,
		CreatedAt:         userSkill.CreatedAt,
		UpdatedAt:         userSkill.UpdatedAt,
	}
	
	// Handle skill relationship
	response.Skill = ToSkillResponse(&userSkill.Skill)
	
	return response
}

func ToLearningSkillResponse(learningSkill *models.LearningSkill) LearningSkillResponse {
	response := LearningSkillResponse{
		ID:           learningSkill.ID,
		UserID:       learningSkill.UserID,
		SkillID:      learningSkill.SkillID,
		DesiredLevel: string(learningSkill.DesiredLevel),
		Priority:     learningSkill.Priority,
		Notes:        learningSkill.Notes,
		CreatedAt:    learningSkill.CreatedAt,
	}
	
	// Handle skill relationship
	response.Skill = ToSkillResponse(&learningSkill.Skill)
	
	return response
}
