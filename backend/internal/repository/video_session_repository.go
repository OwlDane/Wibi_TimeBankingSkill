package repository

import (
	"errors"
	"fmt"

	"github.com/timebankingskill/backend/internal/models"
	"gorm.io/gorm"
)

// VideoSessionRepository handles video session data access
type VideoSessionRepository struct {
	db *gorm.DB
}

// NewVideoSessionRepository creates a new video session repository
func NewVideoSessionRepository(db *gorm.DB) *VideoSessionRepository {
	return &VideoSessionRepository{db: db}
}

// CreateVideoSession creates a new video session
func (r *VideoSessionRepository) CreateVideoSession(videoSession *models.VideoSession) (*models.VideoSession, error) {
	if err := r.db.Create(videoSession).Error; err != nil {
		return nil, fmt.Errorf("failed to create video session: %w", err)
	}
	return videoSession, nil
}

// GetVideoSessionByID gets a video session by ID
func (r *VideoSessionRepository) GetVideoSessionByID(id uint) (*models.VideoSession, error) {
	var videoSession models.VideoSession
	if err := r.db.Preload("Session").First(&videoSession, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("video session not found")
		}
		return nil, fmt.Errorf("failed to get video session: %w", err)
	}
	return &videoSession, nil
}

// GetVideoSessionBySessionID gets a video session by session ID
func (r *VideoSessionRepository) GetVideoSessionBySessionID(sessionID uint) (*models.VideoSession, error) {
	var videoSession models.VideoSession
	if err := r.db.Preload("Session").Where("session_id = ?", sessionID).First(&videoSession).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("video session not found")
		}
		return nil, fmt.Errorf("failed to get video session: %w", err)
	}
	return &videoSession, nil
}

// GetVideoSessionByRoomID gets a video session by room ID
func (r *VideoSessionRepository) GetVideoSessionByRoomID(roomID string) (*models.VideoSession, error) {
	var videoSession models.VideoSession
	if err := r.db.Preload("Session").Where("room_id = ?", roomID).First(&videoSession).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("video session not found")
		}
		return nil, fmt.Errorf("failed to get video session: %w", err)
	}
	return &videoSession, nil
}

// UpdateVideoSession updates a video session
func (r *VideoSessionRepository) UpdateVideoSession(id uint, videoSession *models.VideoSession) (*models.VideoSession, error) {
	if err := r.db.Model(&models.VideoSession{}).Where("id = ?", id).Updates(videoSession).Error; err != nil {
		return nil, fmt.Errorf("failed to update video session: %w", err)
	}
	return r.GetVideoSessionByID(id)
}

// EndVideoSession ends a video session
func (r *VideoSessionRepository) EndVideoSession(id uint, duration int) (*models.VideoSession, error) {
	videoSession := &models.VideoSession{
		Duration: duration,
		Status:   "completed",
	}
	return r.UpdateVideoSession(id, videoSession)
}

// GetUserVideoHistory gets video call history for a user
func (r *VideoSessionRepository) GetUserVideoHistory(userID uint, limit int, offset int) ([]models.VideoSession, int64, error) {
	var videoSessions []models.VideoSession
	var total int64

	query := r.db.
		Joins("JOIN sessions ON sessions.id = video_sessions.session_id").
		Where("(sessions.tutor_id = ? OR sessions.student_id = ?)", userID, userID).
		Preload("Session").
		Order("video_sessions.created_at DESC")

	if err := query.Model(&models.VideoSession{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count video sessions: %w", err)
	}

	if err := query.Limit(limit).Offset(offset).Find(&videoSessions).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get video history: %w", err)
	}

	return videoSessions, total, nil
}

// GetActiveVideoSession gets active video session for a session
func (r *VideoSessionRepository) GetActiveVideoSession(sessionID uint) (*models.VideoSession, error) {
	var videoSession models.VideoSession
	if err := r.db.
		Where("session_id = ? AND status = ?", sessionID, "active").
		Preload("Session").
		First(&videoSession).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("no active video session")
		}
		return nil, fmt.Errorf("failed to get active video session: %w", err)
	}
	return &videoSession, nil
}

// DeleteVideoSession deletes a video session (soft delete)
func (r *VideoSessionRepository) DeleteVideoSession(id uint) error {
	if err := r.db.Delete(&models.VideoSession{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete video session: %w", err)
	}
	return nil
}

// GetVideoSessionStats gets statistics for a user's video sessions
func (r *VideoSessionRepository) GetVideoSessionStats(userID uint) (map[string]interface{}, error) {
	var stats struct {
		TotalCalls   int64
		TotalMinutes int64
		AvgDuration  float64
	}

	query := r.db.
		Joins("JOIN sessions ON sessions.id = video_sessions.session_id").
		Where("(sessions.tutor_id = ? OR sessions.student_id = ?) AND video_sessions.status = ?", userID, userID, "completed")

	if err := query.
		Select("COUNT(*) as total_calls, COALESCE(SUM(duration), 0) as total_minutes, COALESCE(AVG(duration), 0) as avg_duration").
		Scan(&stats).Error; err != nil {
		return nil, fmt.Errorf("failed to get video stats: %w", err)
	}

	return map[string]interface{}{
		"total_calls":   stats.TotalCalls,
		"total_minutes": stats.TotalMinutes,
		"avg_duration":  stats.AvgDuration,
	}, nil
}
