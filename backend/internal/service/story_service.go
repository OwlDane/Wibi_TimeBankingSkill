package service

import (
	"errors"
	"fmt"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// StoryService handles success story business logic
type StoryService struct {
	storyRepo *repository.StoryRepository
	userRepo  *repository.UserRepository
}

// NewStoryService creates a new story service
func NewStoryService(
	storyRepo *repository.StoryRepository,
	userRepo *repository.UserRepository,
) *StoryService {
	return &StoryService{
		storyRepo: storyRepo,
		userRepo:  userRepo,
	}
}

// ===== STORY OPERATIONS =====

// CreateStory creates a new success story
func (s *StoryService) CreateStory(userID uint, req *dto.CreateStoryRequest) (*models.SuccessStory, error) {
	// Validate user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	story := &models.SuccessStory{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Images:      req.Images,
		Tags:        req.Tags,
		IsPublished: req.IsPublished,
	}

	if err := s.storyRepo.CreateStory(story); err != nil {
		return nil, fmt.Errorf("failed to create story: %w", err)
	}

	return s.storyRepo.GetStoryByID(story.ID)
}

// GetStoryByID gets a story by ID
func (s *StoryService) GetStoryByID(id uint) (*models.SuccessStory, error) {
	story, err := s.storyRepo.GetStoryByID(id)
	if err != nil {
		return nil, errors.New("story not found")
	}

	return story, nil
}

// GetPublishedStories gets all published stories
func (s *StoryService) GetPublishedStories(limit, offset int) ([]models.SuccessStory, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.storyRepo.GetPublishedStories(limit, offset)
}

// GetStoriesByUser gets stories by a user
func (s *StoryService) GetStoriesByUser(userID uint, limit, offset int) ([]models.SuccessStory, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.storyRepo.GetStoriesByUser(userID, limit, offset)
}

// UpdateStory updates a story
func (s *StoryService) UpdateStory(storyID, userID uint, req *dto.UpdateStoryRequest) (*models.SuccessStory, error) {
	story, err := s.storyRepo.GetStoryByID(storyID)
	if err != nil {
		return nil, errors.New("story not found")
	}

	// Check authorization
	if story.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	story.Title = req.Title
	story.Description = req.Description
	story.Images = req.Images
	story.Tags = req.Tags
	story.IsPublished = req.IsPublished

	if err := s.storyRepo.UpdateStory(story); err != nil {
		return nil, fmt.Errorf("failed to update story: %w", err)
	}

	return story, nil
}

// DeleteStory deletes a story
func (s *StoryService) DeleteStory(storyID, userID uint) error {
	story, err := s.storyRepo.GetStoryByID(storyID)
	if err != nil {
		return errors.New("story not found")
	}

	// Check authorization
	if story.UserID != userID {
		return errors.New("unauthorized")
	}

	return s.storyRepo.DeleteStory(storyID)
}

// ===== COMMENT OPERATIONS =====

// CreateComment creates a new story comment
func (s *StoryService) CreateComment(userID uint, req *dto.CreateCommentRequest) (*models.StoryComment, error) {
	// Validate user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Validate story exists
	_, err = s.storyRepo.GetStoryByID(req.StoryID)
	if err != nil {
		return nil, errors.New("story not found")
	}

	comment := &models.StoryComment{
		StoryID:  req.StoryID,
		AuthorID: userID,
		Content:  req.Content,
	}

	if err := s.storyRepo.CreateComment(comment); err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return comment, nil
}

// GetCommentsByStory gets comments for a story
func (s *StoryService) GetCommentsByStory(storyID uint, limit, offset int) ([]models.StoryComment, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	return s.storyRepo.GetCommentsByStory(storyID, limit, offset)
}

// DeleteComment deletes a comment
func (s *StoryService) DeleteComment(commentID, userID uint) error {
	return s.storyRepo.DeleteComment(commentID)
}

// LikeStory increments like count
func (s *StoryService) LikeStory(storyID uint) error {
	return s.storyRepo.IncrementStoryLikes(storyID)
}

// UnlikeStory decrements like count
func (s *StoryService) UnlikeStory(storyID uint) error {
	return s.storyRepo.DecrementStoryLikes(storyID)
}
