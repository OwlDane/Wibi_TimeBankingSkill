package models

// SkillProgress tracks learning progress for a user's skill
type SkillProgress struct {
	ID                    uint    `gorm:"primaryKey" json:"id"`
	UserID                uint    `gorm:"index" json:"user_id"`
	User                  *User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	SkillID               uint    `gorm:"index" json:"skill_id"`
	Skill                 *Skill  `gorm:"foreignKey:SkillID;constraint:OnDelete:CASCADE" json:"skill,omitempty"`
	ProgressPercentage    float64 `json:"progress_percentage"` // 0-100
	SessionsCompleted     int     `json:"sessions_completed"`
	TotalHoursSpent       float64 `json:"total_hours_spent"`
	CurrentLevel          string  `json:"current_level"` // "beginner", "intermediate", "advanced", "expert"
	LastActivityAt        int64   `json:"last_activity_at"`
	EstimatedCompletionAt int64   `json:"estimated_completion_at"`
	CreatedAt             int64   `gorm:"autoCreateTime:milli" json:"created_at"`
	UpdatedAt             int64   `gorm:"autoUpdateTime:milli" json:"updated_at"`
}

// TableName specifies the table name
func (SkillProgress) TableName() string {
	return "skill_progress"
}

// Milestone represents a learning milestone
type Milestone struct {
	ID                uint    `gorm:"primaryKey" json:"id"`
	SkillProgressID   uint    `gorm:"index" json:"skill_progress_id"`
	SkillProgress     *SkillProgress `gorm:"foreignKey:SkillProgressID;constraint:OnDelete:CASCADE" json:"skill_progress,omitempty"`
	Title             string  `json:"title"`
	Description       string  `json:"description"`
	ProgressThreshold float64 `json:"progress_threshold"` // 0-100
	IsAchieved        bool    `json:"is_achieved"`
	AchievedAt        int64   `json:"achieved_at,omitempty"`
	CreatedAt         int64   `gorm:"autoCreateTime:milli" json:"created_at"`
}

// TableName specifies the table name
func (Milestone) TableName() string {
	return "milestones"
}
