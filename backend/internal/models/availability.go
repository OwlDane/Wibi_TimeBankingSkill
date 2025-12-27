package models

import (
	"time"

	"gorm.io/gorm"
)

// Availability represents a teacher's available time slots for teaching
// Each record represents one day's availability for a user
type Availability struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	UserID    uint `gorm:"not null;index" json:"user_id"`
	DayOfWeek int  `gorm:"not null" json:"day_of_week"` // 0=Sunday, 1=Monday, ..., 6=Saturday

	// Time slots (can have multiple slots per day by creating multiple records)
	StartTime string `gorm:"not null" json:"start_time"` // Format: "09:00"
	EndTime   string `gorm:"not null" json:"end_time"`   // Format: "17:00"

	// Status
	IsActive bool `gorm:"default:true" json:"is_active"` // User can disable without deleting

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName specifies the table name for Availability model
func (Availability) TableName() string {
	return "availabilities"
}

// DayName returns the day name for the day of week
func (a *Availability) DayName() string {
	days := []string{"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}
	if a.DayOfWeek >= 0 && a.DayOfWeek < len(days) {
		return days[a.DayOfWeek]
	}
	return "Unknown"
}

// IsValidTimeRange checks if the time range is valid
func (a *Availability) IsValidTimeRange() bool {
	return a.StartTime < a.EndTime
}
