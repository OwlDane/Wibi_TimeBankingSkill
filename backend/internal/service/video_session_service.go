package service
 
import (
	"errors"
	"fmt"
	"time"
 
	"github.com/timebankingskill/backend/internal/config"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)
 
// VideoSessionService handles video call business logic
type VideoSessionService struct {
	videoSessionRepo *repository.VideoSessionRepository
	sessionRepo      *repository.SessionRepository
	userRepo         *repository.UserRepository
	notificationSvc  *NotificationService
	config           *config.Config
}
 
// NewVideoSessionServiceWithNotification creates a new video session service
func NewVideoSessionServiceWithNotification(
	videoSessionRepo *repository.VideoSessionRepository,
	sessionRepo *repository.SessionRepository,
	userRepo *repository.UserRepository,
	notificationSvc *NotificationService,
	cfg *config.Config,
) *VideoSessionService {
	return &VideoSessionService{
		videoSessionRepo: videoSessionRepo,
		sessionRepo:      sessionRepo,
		userRepo:         userRepo,
		notificationSvc:  notificationSvc,
		config:           cfg,
	}
}
 
// StartVideoSession starts a new video call for an existing session
func (s *VideoSessionService) StartVideoSession(userID uint, sessionID uint) (*dto.StartVideoSessionResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, err
	}
 
	// Verify user is part of session
	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("you are not authorized to start this video session")
	}
 
	// Room ID is typically a combination of session ID and a unique string
	roomID := fmt.Sprintf("wibi-session-%d-%d", sessionID, time.Now().Unix())
 
	now := time.Now()
	videoSession := &models.VideoSession{
		SessionID: sessionID,
		RoomID:    roomID,
		StartedAt: &now,
		Status:    "active",
	}
 
	created, err := s.videoSessionRepo.CreateVideoSession(videoSession)
	if err != nil {
		return nil, err
	}
 
	// Generate Jitsi URL
	jitsiURL := fmt.Sprintf("%s/%s", s.config.Jitsi.BaseURL, roomID)
 
	return &dto.StartVideoSessionResponse{
		ID:       created.ID,
		RoomID:   created.RoomID,
		JitsiURL: jitsiURL,
		Status:   created.Status,
		// Token: would be generated here if using Jitsi as a Service auth
	}, nil
}
 
// EndVideoSession marks a video session as completed
func (s *VideoSessionService) EndVideoSession(userID uint, sessionID uint, duration int) (*dto.VideoSessionResponse, error) {
	videoSession, err := s.videoSessionRepo.GetActiveVideoSession(sessionID)
	if err != nil {
		return nil, err
	}
 
	now := time.Now()
	videoSession.EndedAt = &now
	videoSession.Duration = duration
	videoSession.Status = "completed"
 
	updated, err := s.videoSessionRepo.UpdateVideoSession(videoSession.ID, videoSession)
	if err != nil {
		return nil, err
	}
 
	return &dto.VideoSessionResponse{
		ID:               updated.ID,
		SessionID:        updated.SessionID,
		RoomID:           updated.RoomID,
		StartedAt:        updated.StartedAt,
		EndedAt:          updated.EndedAt,
		Duration:         updated.Duration,
		ParticipantCount: updated.ParticipantCount,
		Status:           updated.Status,
		CreatedAt:        updated.CreatedAt,
		UpdatedAt:        updated.UpdatedAt,
	}, nil
}
 
// GetVideoSessionStatus retrieves status of a video call
func (s *VideoSessionService) GetVideoSessionStatus(userID uint, sessionID uint) (*dto.VideoSessionResponse, error) {
	videoSession, err := s.videoSessionRepo.GetVideoSessionBySessionID(sessionID)
	if err != nil {
		return nil, err
	}
 
	return &dto.VideoSessionResponse{
		ID:               videoSession.ID,
		SessionID:        videoSession.SessionID,
		RoomID:           videoSession.RoomID,
		StartedAt:        videoSession.StartedAt,
		EndedAt:          videoSession.EndedAt,
		Duration:         videoSession.Duration,
		ParticipantCount: videoSession.ParticipantCount,
		Status:           videoSession.Status,
		CreatedAt:        videoSession.CreatedAt,
		UpdatedAt:        videoSession.UpdatedAt,
	}, nil
}
 
// GetVideoHistory returns completed video sessions for a user
func (s *VideoSessionService) GetVideoHistory(userID uint, limit int, offset int) ([]dto.VideoHistoryResponse, int64, error) {
	history, total, err := s.videoSessionRepo.GetUserVideoHistory(userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
 
	var response []dto.VideoHistoryResponse
	for _, vs := range history {
		partnerName := ""
		if vs.Session != nil {
			if vs.Session.TeacherID == userID {
				// Partner is student
				student, _ := s.userRepo.GetByID(vs.Session.StudentID)
				if student != nil {
					partnerName = student.FullName
				}
			} else {
				// Partner is teacher
				teacher, _ := s.userRepo.GetByID(vs.Session.TeacherID)
				if teacher != nil {
					partnerName = teacher.FullName
				}
			}
		}
 
		response = append(response, dto.VideoHistoryResponse{
			ID:               vs.ID,
			SessionID:        vs.SessionID,
			SkillName:        vs.Session.Title, // Assuming Title is used as skill name reference in session
			PartnerName:      partnerName,
			StartedAt:        vs.StartedAt,
			Duration:         vs.Duration,
			ParticipantCount: vs.ParticipantCount,
			Status:           vs.Status,
		})
	}
 
	return response, total, nil
}
 
// GetVideoStats returns video calling statistics
func (s *VideoSessionService) GetVideoStats(userID uint) (map[string]interface{}, error) {
	return s.videoSessionRepo.GetVideoSessionStats(userID)
}
