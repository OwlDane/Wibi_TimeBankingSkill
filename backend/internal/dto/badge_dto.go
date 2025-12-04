package dto

import (
	"github.com/timebankingskill/backend/internal/models"
)

// BadgeResponse represents a badge in API responses
type BadgeResponse struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Icon         string `json:"icon"`
	Type         string `json:"type"`
	Requirements string `json:"requirements"`
	BonusCredits float64 `json:"bonus_credits"`
	Rarity       int    `json:"rarity"`
	TotalAwarded int    `json:"total_awarded"`
	Color        string `json:"color"`
	IsActive     bool   `json:"is_active"`
	DisplayOrder int    `json:"display_order"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// UserBadgeResponse represents a badge earned by a user
type UserBadgeResponse struct {
	ID             uint           `json:"id"`
	UserID         uint           `json:"user_id"`
	BadgeID        uint           `json:"badge_id"`
	Badge          *BadgeResponse `json:"badge,omitempty"`
	EarnedAt       string         `json:"earned_at"`
	Progress       int            `json:"progress"`
	ProgressGoal   int            `json:"progress_goal"`
	ProgressPercent float64       `json:"progress_percent"`
	IsPinned       bool           `json:"is_pinned"`
	IsCompleted    bool           `json:"is_completed"`
}

// LeaderboardEntry represents a user in leaderboard
type LeaderboardEntry struct {
	UserID    uint   `json:"user_id"`
	Username  string `json:"username"`
	FullName  string `json:"full_name"`
	Avatar    string `json:"avatar"`
	Score     int    `json:"score"`
	ScoreType string `json:"score_type"` // badges, rarity, sessions, rating, credits
	Rank      int    `json:"rank,omitempty"`
}

// LeaderboardResponse represents leaderboard data
type LeaderboardResponse struct {
	Type       string             `json:"type"`
	Entries    []LeaderboardEntry `json:"entries"`
	Total      int                `json:"total"`
	UpdatedAt  string             `json:"updated_at"`
}

// MapBadgeToResponse maps a Badge model to BadgeResponse
func MapBadgeToResponse(badge *models.Badge) *BadgeResponse {
	return &BadgeResponse{
		ID:           badge.ID,
		Name:         badge.Name,
		Description:  badge.Description,
		Icon:         badge.Icon,
		Type:         string(badge.Type),
		Requirements: badge.Requirements,
		BonusCredits: badge.BonusCredits,
		Rarity:       badge.Rarity,
		TotalAwarded: badge.TotalAwarded,
		Color:        badge.Color,
		IsActive:     badge.IsActive,
		DisplayOrder: badge.DisplayOrder,
		CreatedAt:    badge.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    badge.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// MapBadgesToResponse maps a slice of Badge models to BadgeResponse
func MapBadgesToResponse(badges []models.Badge) []BadgeResponse {
	responses := make([]BadgeResponse, len(badges))
	for i, badge := range badges {
		resp := MapBadgeToResponse(&badge)
		responses[i] = *resp
	}
	return responses
}

// MapUserBadgeToResponse maps a UserBadge model to UserBadgeResponse
func MapUserBadgeToResponse(userBadge *models.UserBadge) *UserBadgeResponse {
	resp := &UserBadgeResponse{
		ID:             userBadge.ID,
		UserID:         userBadge.UserID,
		BadgeID:        userBadge.BadgeID,
		EarnedAt:       userBadge.EarnedAt.Format("2006-01-02T15:04:05Z07:00"),
		Progress:       userBadge.Progress,
		ProgressGoal:   userBadge.ProgressGoal,
		ProgressPercent: userBadge.ProgressPercentage(),
		IsPinned:       userBadge.IsPinned,
		IsCompleted:    userBadge.IsCompleted(),
	}

	if userBadge.Badge.ID > 0 {
		resp.Badge = MapBadgeToResponse(&userBadge.Badge)
	}

	return resp
}

// MapUserBadgesToResponse maps a slice of UserBadge models to UserBadgeResponse
func MapUserBadgesToResponse(userBadges []models.UserBadge) []UserBadgeResponse {
	responses := make([]UserBadgeResponse, len(userBadges))
	for i, userBadge := range userBadges {
		resp := MapUserBadgeToResponse(&userBadge)
		responses[i] = *resp
	}
	return responses
}
