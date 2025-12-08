package dto

// SkillProgressResponse represents skill progress in API responses
type SkillProgressResponse struct {
	ID                    uint                `json:"id"`
	UserID                uint                `json:"user_id"`
	SkillID               uint                `json:"skill_id"`
	SkillName             string              `json:"skill_name"`
	ProgressPercentage    float64             `json:"progress_percentage"`
	SessionsCompleted     int                 `json:"sessions_completed"`
	TotalHoursSpent       float64             `json:"total_hours_spent"`
	CurrentLevel          string              `json:"current_level"`
	LastActivityAt        int64               `json:"last_activity_at"`
	EstimatedCompletionAt int64               `json:"estimated_completion_at"`
	Milestones            []MilestoneResponse `json:"milestones,omitempty"`
	CreatedAt             int64               `json:"created_at"`
	UpdatedAt             int64               `json:"updated_at"`
}

// MilestoneResponse represents a milestone in API responses
type MilestoneResponse struct {
	ID                    uint    `json:"id"`
	Title                 string  `json:"title"`
	Description           string  `json:"description"`
	ProgressThreshold     float64 `json:"progress_threshold"`
	IsAchieved            bool    `json:"is_achieved"`
	AchievedAt            int64   `json:"achieved_at,omitempty"`
	CreatedAt             int64   `json:"created_at"`
}

// UpdateProgressRequest represents a request to update progress
type UpdateProgressRequest struct {
	SessionsCompleted int     `json:"sessions_completed" binding:"required"`
	TotalHoursSpent   float64 `json:"total_hours_spent" binding:"required"`
}

// ProgressSummaryResponse represents overall progress summary
type ProgressSummaryResponse struct {
	TotalSkillsLearning int                  `json:"total_skills_learning"`
	AverageProgress     float64              `json:"average_progress"`
	TotalHoursSpent     float64              `json:"total_hours_spent"`
	SkillsProgresses    []SkillProgressResponse `json:"skills_progresses"`
}

// ProgressChartResponse represents progress data for charts
type ProgressChartResponse struct {
	SkillID    uint      `json:"skill_id"`
	SkillName  string    `json:"skill_name"`
	Progress   []float64 `json:"progress"`
	Dates      []string  `json:"dates"`
	CurrentLevel string  `json:"current_level"`
}
