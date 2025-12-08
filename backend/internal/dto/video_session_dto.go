package dto

import "time"

// StartVideoSessionRequest is the request to start a video session
type StartVideoSessionRequest struct {
	SessionID uint `json:"session_id" binding:"required"`
}

// StartVideoSessionResponse is the response when starting a video session
type StartVideoSessionResponse struct {
	ID       uint   `json:"id"`
	RoomID   string `json:"room_id"`
	JitsiURL string `json:"jitsi_url"`
	Token    string `json:"token"`
	Status   string `json:"status"`
}

// EndVideoSessionRequest is the request to end a video session
type EndVideoSessionRequest struct {
	Duration int `json:"duration" binding:"required"` // in minutes
}

// VideoSessionResponse is the response for video session details
type VideoSessionResponse struct {
	ID               uint       `json:"id"`
	SessionID        uint       `json:"session_id"`
	RoomID           string     `json:"room_id"`
	StartedAt        *time.Time `json:"started_at"`
	EndedAt          *time.Time `json:"ended_at"`
	Duration         int        `json:"duration"`
	ParticipantCount int        `json:"participant_count"`
	RecordingURL     *string    `json:"recording_url"`
	Status           string     `json:"status"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// VideoHistoryResponse is the response for video call history
type VideoHistoryResponse struct {
	ID               uint       `json:"id"`
	SessionID        uint       `json:"session_id"`
	SkillName        string     `json:"skill_name"`
	PartnerName      string     `json:"partner_name"`
	StartedAt        *time.Time `json:"started_at"`
	Duration         int        `json:"duration"`
	ParticipantCount int        `json:"participant_count"`
	Status           string     `json:"status"`
}

// JitsiTokenRequest is the request to generate Jitsi token
type JitsiTokenRequest struct {
	RoomID   string `json:"room_id" binding:"required"`
	UserID   uint   `json:"user_id" binding:"required"`
	UserName string `json:"user_name" binding:"required"`
}

// JitsiTokenResponse is the response with Jitsi token
type JitsiTokenResponse struct {
	Token    string `json:"token"`
	RoomID   string `json:"room_id"`
	JitsiURL string `json:"jitsi_url"`
}
