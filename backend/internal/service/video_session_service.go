package service

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// VideoSessionService handles video session business logic
type VideoSessionService struct {
	videoSessionRepo    *repository.VideoSessionRepository
	sessionRepo         *repository.SessionRepository
	userRepo            *repository.UserRepository
	notificationService *NotificationService
	jitsiSecret         string
	jitsiAppID          string
	jitsiBaseURL        string
}

// NewVideoSessionService creates a new video session service
func NewVideoSessionService(
	videoSessionRepo *repository.VideoSessionRepository,
	sessionRepo *repository.SessionRepository,
	userRepo *repository.UserRepository,
) *VideoSessionService {
	return &VideoSessionService{
		videoSessionRepo:    videoSessionRepo,
		sessionRepo:         sessionRepo,
		userRepo:            userRepo,
		notificationService: nil,
		jitsiSecret:         "your-jitsi-secret", // Should be from env
		jitsiAppID:          "your-jitsi-app-id", // Should be from env
		jitsiBaseURL:        "https://meet.jit.si",
	}
}

// NewVideoSessionServiceWithNotification creates a new video session service with notifications
func NewVideoSessionServiceWithNotification(
	videoSessionRepo *repository.VideoSessionRepository,
	sessionRepo *repository.SessionRepository,
	userRepo *repository.UserRepository,
	notificationService *NotificationService,
) *VideoSessionService {
	return &VideoSessionService{
		videoSessionRepo:    videoSessionRepo,
		sessionRepo:         sessionRepo,
		userRepo:            userRepo,
		notificationService: notificationService,
		jitsiSecret:         "your-jitsi-secret",
		jitsiAppID:          "your-jitsi-app-id",
		jitsiBaseURL:        "https://meet.jit.si",
	}
}

// StartVideoSession starts a new video session
func (s *VideoSessionService) StartVideoSession(userID uint, sessionID uint) (*dto.StartVideoSessionResponse, error) {
	// Validate session exists
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Validate user is part of session
	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("unauthorized to start video session")
	}

	// Check if session already has active video session
	existingSession, _ := s.videoSessionRepo.GetActiveVideoSession(sessionID)
	if existingSession != nil {
		return nil, errors.New("video session already active")
	}

	// Generate room ID
	roomID := fmt.Sprintf("wibi-session-%d-%d", sessionID, time.Now().Unix())

	// Create video session record
	videoSession := &models.VideoSession{
		SessionID: sessionID,
		RoomID:    roomID,
		Status:    "active",
		StartedAt: &[]time.Time{time.Now()}[0],
	}

	createdSession, err := s.videoSessionRepo.CreateVideoSession(videoSession)
	if err != nil {
		return nil, err
	}

	// Generate Jitsi token
	token := s.generateJitsiToken(roomID, userID)

	// Trigger notification
	if s.notificationService != nil {
		user, _ := s.userRepo.FindByID(userID)
		otherUserID := session.StudentID
		if userID == session.StudentID {
			otherUserID = session.TeacherID
		}

		s.notificationService.CreateNotification(
			otherUserID,
			"video_call",
			"Video Call Started",
			fmt.Sprintf("%s started a video call for your session", user.FullName),
			map[string]interface{}{
				"session_id": sessionID,
				"video_session_id": createdSession.ID,
			},
		)
	}

	return &dto.StartVideoSessionResponse{
		ID:       createdSession.ID,
		RoomID:   roomID,
		JitsiURL: fmt.Sprintf("%s/%s", s.jitsiBaseURL, roomID),
		Token:    token,
		Status:   "active",
	}, nil
}

// EndVideoSession ends a video session
func (s *VideoSessionService) EndVideoSession(userID uint, sessionID uint, duration int) (*dto.VideoSessionResponse, error) {
	// Get video session
	videoSession, err := s.videoSessionRepo.GetVideoSessionBySessionID(sessionID)
	if err != nil {
		return nil, err
	}

	// Validate user is part of session
	session, _ := s.sessionRepo.GetByID(sessionID)
	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("unauthorized to end video session")
	}

	// Update video session
	now := time.Now()
	videoSession.EndedAt = &now
	videoSession.Duration = duration
	videoSession.Status = "completed"

	updatedSession, err := s.videoSessionRepo.UpdateVideoSession(videoSession.ID, videoSession)
	if err != nil {
		return nil, err
	}

	// Trigger notification
	if s.notificationService != nil {
		user, _ := s.userRepo.FindByID(userID)
		otherUserID := session.StudentID
		if userID == session.StudentID {
			otherUserID = session.TeacherID
		}

		s.notificationService.CreateNotification(
			otherUserID,
			"video_call",
			"Video Call Ended",
			fmt.Sprintf("%s ended the video call (Duration: %d minutes)", user.FullName, duration),
			map[string]interface{}{
				"session_id": sessionID,
				"duration": duration,
			},
		)
	}

	return s.mapToVideoSessionResponse(updatedSession), nil
}

// GetVideoSessionStatus gets the status of a video session
func (s *VideoSessionService) GetVideoSessionStatus(userID uint, sessionID uint) (*dto.VideoSessionResponse, error) {
	// Validate user is part of session
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("unauthorized")
	}

	// Get video session
	videoSession, err := s.videoSessionRepo.GetVideoSessionBySessionID(sessionID)
	if err != nil {
		return nil, err
	}

	return s.mapToVideoSessionResponse(videoSession), nil
}

// GetVideoHistory gets video call history for a user
func (s *VideoSessionService) GetVideoHistory(userID uint, limit int, offset int) ([]map[string]interface{}, int64, error) {
	videoSessions, total, err := s.videoSessionRepo.GetUserVideoHistory(userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	var result []map[string]interface{}
	for _, vs := range videoSessions {
		if vs.Session != nil {
			skillName := ""
			if vs.Session.UserSkill.ID != 0 && vs.Session.UserSkill.Skill.ID != 0 {
				skillName = vs.Session.UserSkill.Skill.Name
			}

			partnerID := vs.Session.StudentID
			if vs.Session.StudentID == userID {
				partnerID = vs.Session.TeacherID
			}

			partner, _ := s.userRepo.FindByID(partnerID)
			partnerName := "Unknown"
			if partner != nil {
				partnerName = partner.FullName
			}

			result = append(result, map[string]interface{}{
				"id":                vs.ID,
				"session_id":        vs.SessionID,
				"skill_name":        skillName,
				"partner_name":      partnerName,
				"started_at":        vs.StartedAt,
				"duration":          vs.Duration,
				"participant_count": vs.ParticipantCount,
				"status":            vs.Status,
			})
		}
	}

	return result, total, nil
}

// GetVideoStats gets video session statistics for a user
func (s *VideoSessionService) GetVideoStats(userID uint) (map[string]interface{}, error) {
	return s.videoSessionRepo.GetVideoSessionStats(userID)
}

// generateJitsiToken generates a Jitsi token for a room
func (s *VideoSessionService) generateJitsiToken(roomID string, userID uint) string {
	// Simple token generation (in production, use proper JWT library)
	// This is a simplified version - in production use github.com/golang-jwt/jwt
	data := fmt.Sprintf("%s-%d-%d", roomID, userID, time.Now().Unix())
	hash := sha256.Sum256([]byte(data + s.jitsiSecret))
	return hex.EncodeToString(hash[:])
}

// mapToVideoSessionResponse maps VideoSession to response DTO
func (s *VideoSessionService) mapToVideoSessionResponse(vs *models.VideoSession) *dto.VideoSessionResponse {
	return &dto.VideoSessionResponse{
		ID:               vs.ID,
		SessionID:        vs.SessionID,
		RoomID:           vs.RoomID,
		StartedAt:        vs.StartedAt,
		EndedAt:          vs.EndedAt,
		Duration:         vs.Duration,
		ParticipantCount: vs.ParticipantCount,
		RecordingURL:     vs.RecordingURL,
		Status:           vs.Status,
		CreatedAt:        vs.CreatedAt,
		UpdatedAt:        vs.UpdatedAt,
	}
}
