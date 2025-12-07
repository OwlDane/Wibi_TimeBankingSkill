package service

import (
	"errors"
	"fmt"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// ForumService handles forum business logic
type ForumService struct {
	forumRepo *repository.ForumRepository
	userRepo  *repository.UserRepository
}

// NewForumService creates a new forum service
func NewForumService(
	forumRepo *repository.ForumRepository,
	userRepo *repository.UserRepository,
) *ForumService {
	return &ForumService{
		forumRepo: forumRepo,
		userRepo:  userRepo,
	}
}

// ===== CATEGORY OPERATIONS =====

// GetAllCategories gets all forum categories
func (s *ForumService) GetAllCategories() ([]models.ForumCategory, error) {
	return s.forumRepo.GetAllCategories()
}

// ===== THREAD OPERATIONS =====

// CreateThread creates a new forum thread
func (s *ForumService) CreateThread(userID uint, req *dto.CreateThreadRequest) (*models.ForumThread, error) {
	// Validate user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Validate category exists
	_, err = s.forumRepo.GetCategoryByID(req.CategoryID)
	if err != nil {
		return nil, errors.New("category not found")
	}

	thread := &models.ForumThread{
		CategoryID: req.CategoryID,
		AuthorID:   userID,
		Title:      req.Title,
		Content:    req.Content,
		Tags:       req.Tags,
	}

	if err := s.forumRepo.CreateThread(thread); err != nil {
		return nil, fmt.Errorf("failed to create thread: %w", err)
	}

	return s.forumRepo.GetThreadByID(thread.ID)
}

// GetThreadByID gets a thread by ID
func (s *ForumService) GetThreadByID(id uint) (*models.ForumThread, error) {
	thread, err := s.forumRepo.GetThreadByID(id)
	if err != nil {
		return nil, errors.New("thread not found")
	}

	// Increment view count
	_ = s.forumRepo.IncrementThreadViewCount(id)

	return thread, nil
}

// GetThreadsByCategory gets threads in a category
func (s *ForumService) GetThreadsByCategory(categoryID uint, limit, offset int) ([]models.ForumThread, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.forumRepo.GetThreadsByCategory(categoryID, limit, offset)
}

// GetThreadsByAuthor gets threads by a user
func (s *ForumService) GetThreadsByAuthor(authorID uint, limit, offset int) ([]models.ForumThread, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.forumRepo.GetThreadsByAuthor(authorID, limit, offset)
}

// UpdateThread updates a thread
func (s *ForumService) UpdateThread(threadID, userID uint, req *dto.UpdateThreadRequest) (*models.ForumThread, error) {
	thread, err := s.forumRepo.GetThreadByID(threadID)
	if err != nil {
		return nil, errors.New("thread not found")
	}

	// Check authorization
	if thread.AuthorID != userID {
		return nil, errors.New("unauthorized")
	}

	thread.Title = req.Title
	thread.Content = req.Content
	thread.Tags = req.Tags

	if err := s.forumRepo.UpdateThread(thread); err != nil {
		return nil, fmt.Errorf("failed to update thread: %w", err)
	}

	return thread, nil
}

// ===== REPLY OPERATIONS =====

// CreateReply creates a new forum reply
func (s *ForumService) CreateReply(userID uint, req *dto.CreateReplyRequest) (*models.ForumReply, error) {
	// Validate user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Validate thread exists
	_, err = s.forumRepo.GetThreadByID(req.ThreadID)
	if err != nil {
		return nil, errors.New("thread not found")
	}

	reply := &models.ForumReply{
		ThreadID: req.ThreadID,
		AuthorID: userID,
		Content:  req.Content,
	}

	if err := s.forumRepo.CreateReply(reply); err != nil {
		return nil, fmt.Errorf("failed to create reply: %w", err)
	}

	return reply, nil
}

// GetRepliesByThread gets replies for a thread
func (s *ForumService) GetRepliesByThread(threadID uint, limit, offset int) ([]models.ForumReply, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.forumRepo.GetRepliesByThread(threadID, limit, offset)
}

// DeleteReply deletes a reply
func (s *ForumService) DeleteReply(replyID, userID uint) error {
	// Note: We need to add GetReplyByID to repository for authorization check
	// For now, just delete
	if err := s.forumRepo.DeleteReply(replyID); err != nil {
		return fmt.Errorf("failed to delete reply: %w", err)
	}

	return nil
}
