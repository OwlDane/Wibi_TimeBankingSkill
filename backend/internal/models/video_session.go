package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// VideoSession represents a video call session
type VideoSession struct {
	ID               uint            `gorm:"primaryKey" json:"id"`
	SessionID        uint            `gorm:"index" json:"session_id"`
	Session          *Session        `gorm:"foreignKey:SessionID" json:"session,omitempty"`
	RoomID           string          `gorm:"index" json:"room_id"`
	StartedAt        *time.Time      `json:"started_at"`
	EndedAt          *time.Time      `json:"ended_at"`
	Duration         int             `json:"duration"` // in minutes
	ParticipantCount int             `json:"participant_count"`
	RecordingURL     *string         `json:"recording_url"`
	Status           string          `gorm:"type:varchar(50);default:'pending'" json:"status"` // pending, active, completed, cancelled
	Metadata         datatypes.JSONMap `gorm:"type:jsonb" json:"metadata"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name for VideoSession
func (VideoSession) TableName() string {
	return "video_sessions"
}
