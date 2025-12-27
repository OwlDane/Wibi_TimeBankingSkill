package models

import (
	"time"

	"gorm.io/gorm"
)

// SkillCategory represents the main category of skills
type SkillCategory string

const (
	CategoryAcademic  SkillCategory = "academic"   // Matematika, Fisika, etc
	CategoryTechnical SkillCategory = "technical"  // Coding, Design, etc
	CategoryCreative  SkillCategory = "creative"   // Music, Art, etc
	CategoryLanguage  SkillCategory = "language"   // English, Japanese, etc
	CategorySports    SkillCategory = "sports"     // Basketball, Swimming, etc
	CategoryOther     SkillCategory = "other"      // Miscellaneous
)

// SkillLevel represents proficiency level
type SkillLevel string

const (
	LevelBeginner     SkillLevel = "beginner"
	LevelIntermediate SkillLevel = "intermediate"
	LevelAdvanced     SkillLevel = "advanced"
	LevelExpert       SkillLevel = "expert"
)

// Skill represents a master skill (e.g., "Mathematics - Calculus")
type Skill struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name        string        `gorm:"not null;uniqueIndex" json:"name"` // e.g., "Calculus"
	Category    SkillCategory `gorm:"not null;index" json:"category"`
	Description string        `gorm:"type:text" json:"description"`
	Icon        string        `json:"icon"` // Icon URL or emoji
	
	// Stats
	TotalTeachers int `gorm:"default:0" json:"total_teachers"`
	TotalLearners int `gorm:"default:0" json:"total_learners"`
	
	// Transient fields for marketplace
	MinRate float64 `gorm:"-" json:"min_rate"`
	MaxRate float64 `gorm:"-" json:"max_rate"`
	
	// Relationships
	UserSkills []UserSkill `gorm:"foreignKey:SkillID" json:"-"`
}

// TableName specifies the table name for Skill model
func (Skill) TableName() string {
	return "skills"
}

// UserSkill represents skills that a user can teach (junction table with extra fields)
type UserSkill struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	UserID  uint `gorm:"not null;index" json:"user_id"`
	SkillID uint `gorm:"not null;index" json:"skill_id"`
	
	// Skill Details
	Level       SkillLevel `gorm:"not null" json:"level"`
	Description string     `gorm:"type:text" json:"description"` // What specifically can they teach
	YearsOfExperience int  `gorm:"default:0" json:"years_of_experience"`
	
	// Proof/Portfolio
	ProofURL    string `json:"proof_url"`    // Certificate, portfolio link
	ProofType   string `json:"proof_type"`   // "certificate", "portfolio", "project"
	
	// Availability
	IsAvailable bool   `gorm:"default:true" json:"is_available"`
	HourlyRate  float64 `gorm:"default:1.0" json:"hourly_rate"` // Usually 1:1, but can be adjusted
	
	// Teaching Preferences
	OnlineOnly  bool `gorm:"default:false" json:"online_only"`
	OfflineOnly bool `gorm:"default:false" json:"offline_only"`
	
	// Stats
	TotalSessions   int     `gorm:"default:0" json:"total_sessions"`
	AverageRating   float64 `gorm:"default:0" json:"average_rating"`
	TotalReviews    int     `gorm:"default:0" json:"total_reviews"`
	
	// Relationships
	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Skill Skill `gorm:"foreignKey:SkillID" json:"skill,omitempty"`
}

// TableName specifies the table name for UserSkill model
func (UserSkill) TableName() string {
	return "user_skills"
}

// LearningSkill represents skills that a user wants to learn (wishlist)
type LearningSkill struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	UserID  uint `gorm:"not null;index" json:"user_id"`
	SkillID uint `gorm:"not null;index" json:"skill_id"`
	
	DesiredLevel SkillLevel `json:"desired_level"`
	Priority     int        `gorm:"default:0" json:"priority"` // 1-5, higher = more urgent
	Notes        string     `gorm:"type:text" json:"notes"`
	
	// Relationships
	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Skill Skill `gorm:"foreignKey:SkillID" json:"skill,omitempty"`
}

// TableName specifies the table name for LearningSkill model
func (LearningSkill) TableName() string {
	return "learning_skills"
}
