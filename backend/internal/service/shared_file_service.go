package service

import (
	"errors"
	"mime/multipart"
	"path/filepath"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// SharedFileService handles file sharing business logic
type SharedFileService struct {
	fileRepo      *repository.SharedFileRepository
	sessionRepo   *repository.SessionRepository
	userRepo      *repository.UserRepository
	notificationService *NotificationService
}

// NewSharedFileService creates a new shared file service
func NewSharedFileService(
	fileRepo *repository.SharedFileRepository,
	sessionRepo *repository.SessionRepository,
	userRepo *repository.UserRepository,
) *SharedFileService {
	return &SharedFileService{
		fileRepo:    fileRepo,
		sessionRepo: sessionRepo,
		userRepo:    userRepo,
	}
}

// NewSharedFileServiceWithNotification creates a new shared file service with notifications
func NewSharedFileServiceWithNotification(
	fileRepo *repository.SharedFileRepository,
	sessionRepo *repository.SessionRepository,
	userRepo *repository.UserRepository,
	notificationService *NotificationService,
) *SharedFileService {
	return &SharedFileService{
		fileRepo:            fileRepo,
		sessionRepo:         sessionRepo,
		userRepo:            userRepo,
		notificationService: notificationService,
	}
}

// UploadFile uploads a file to a session
func (s *SharedFileService) UploadFile(
	userID uint,
	sessionID uint,
	file *multipart.FileHeader,
	description string,
	isPublic bool,
) (*dto.SharedFileResponse, error) {
	// Validate session exists
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Validate user is part of session
	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("unauthorized to upload files to this session")
	}

	// Validate file size (max 50MB)
	if file.Size > 50*1024*1024 {
		return nil, errors.New("file size exceeds 50MB limit")
	}

	// Generate file path
	ext := filepath.Ext(file.Filename)
	fileName := file.Filename
	filePath := "uploads/sessions/" + string(rune(sessionID)) + "/" + fileName
	fileURL := "/api/v1/files/" + string(rune(sessionID)) + "/" + fileName

	// Create shared file record
	sharedFile := &models.SharedFile{
		SessionID:   sessionID,
		UploaderID:  userID,
		FileName:    fileName,
		FileSize:    file.Size,
		FileType:    ext,
		FilePath:    filePath,
		FileURL:     fileURL,
		Description: description,
		IsPublic:    isPublic,
	}

	if err := s.fileRepo.Create(sharedFile); err != nil {
		return nil, err
	}

	// Send notification to other participant
	if s.notificationService != nil {
		otherUserID := session.StudentID
		if userID == session.StudentID {
			otherUserID = session.TeacherID
		}

		uploader, _ := s.userRepo.FindByID(userID)
		s.notificationService.CreateNotification(
			otherUserID,
			"social",
			"File Shared",
			uploader.FullName+" shared a file: "+fileName,
			map[string]interface{}{
				"sessionID": sessionID,
				"fileID":    sharedFile.ID,
				"fileName":  fileName,
			},
		)
	}

	return s.mapToSharedFileResponse(sharedFile), nil
}

// GetSessionFiles gets all files for a session
func (s *SharedFileService) GetSessionFiles(sessionID uint) (*dto.GetSessionFilesResponse, error) {
	files, err := s.fileRepo.GetBySessionID(sessionID)
	if err != nil {
		return nil, err
	}

	response := &dto.GetSessionFilesResponse{
		SessionID: sessionID,
		Files:     make([]dto.SharedFileResponse, 0),
		Count:     len(files),
	}

	for _, file := range files {
		response.Files = append(response.Files, *s.mapToSharedFileResponse(&file))
	}

	return response, nil
}

// GetFile gets a single file
func (s *SharedFileService) GetFile(fileID uint) (*dto.SharedFileResponse, error) {
	file, err := s.fileRepo.GetByID(fileID)
	if err != nil {
		return nil, err
	}
	return s.mapToSharedFileResponse(file), nil
}

// DeleteFile deletes a file
func (s *SharedFileService) DeleteFile(userID uint, fileID uint) error {
	file, err := s.fileRepo.GetByID(fileID)
	if err != nil {
		return err
	}

	// Only uploader can delete
	if file.UploaderID != userID {
		return errors.New("unauthorized to delete this file")
	}

	return s.fileRepo.Delete(fileID)
}

// GetSessionFileStats gets file statistics for a session
func (s *SharedFileService) GetSessionFileStats(sessionID uint) (map[string]interface{}, error) {
	count, err := s.fileRepo.GetSessionFileCount(sessionID)
	if err != nil {
		return nil, err
	}

	totalSize, err := s.fileRepo.GetTotalFileSize(sessionID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"session_id":  sessionID,
		"file_count":  count,
		"total_size":  totalSize,
		"total_size_mb": float64(totalSize) / (1024 * 1024),
	}, nil
}

// mapToSharedFileResponse maps a SharedFile model to response DTO
func (s *SharedFileService) mapToSharedFileResponse(file *models.SharedFile) *dto.SharedFileResponse {
	response := &dto.SharedFileResponse{
		ID:          file.ID,
		SessionID:   file.SessionID,
		UploaderID:  file.UploaderID,
		FileName:    file.FileName,
		FileSize:    file.FileSize,
		FileType:    file.FileType,
		FileURL:     file.FileURL,
		Description: file.Description,
		IsPublic:    file.IsPublic,
		Metadata:    file.Metadata,
		CreatedAt:   file.CreatedAt,
		UpdatedAt:   file.UpdatedAt,
	}

	if file.Uploader != nil {
		response.Uploader = &dto.UserPublicProfile{
			ID:       file.Uploader.ID,
			FullName: file.Uploader.FullName,
			Username: file.Uploader.Username,
			Avatar:   file.Uploader.Avatar,
			School:   file.Uploader.School,
			Grade:    file.Uploader.Grade,
		}
	}

	return response
}
