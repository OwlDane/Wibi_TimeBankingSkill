package service

import (
	"errors"
	"fmt"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// ReviewService handles review business logic
type ReviewService struct {
	reviewRepo          *repository.ReviewRepository
	sessionRepo         *repository.SessionRepository
	userRepo            *repository.UserRepository
	notificationService *NotificationService
}

// NewReviewService creates a new review service
func NewReviewService(
	reviewRepo *repository.ReviewRepository,
	sessionRepo *repository.SessionRepository,
	userRepo *repository.UserRepository,
	notificationService *NotificationService,
) *ReviewService {
	return &ReviewService{
		reviewRepo:          reviewRepo,
		sessionRepo:         sessionRepo,
		userRepo:            userRepo,
		notificationService: notificationService,
	}
}

// CreateReview creates a new review for a completed session
// Implements bidirectional review system: both teacher and student can review each other
//
// Review Flow:
//   1. Validates rating is within 1-5 range
//   2. Validates session exists and is completed
//   3. Determines review type (teacher reviewing student OR student reviewing teacher)
//   4. Prevents duplicate reviews from same reviewer
//   5. Creates review record with ratings and optional comment
//   6. Updates user's average rating statistics
//   7. Sends notification to reviewee
//
// Review Types:
//   - ReviewTypeTeacher: Student reviewing the teacher
//   - ReviewTypeStudent: Teacher reviewing the student
//
// Rating Components:
//   - Overall rating (1-5 stars)
//   - Communication rating (optional)
//   - Punctuality rating (optional)
//   - Knowledge rating (optional)
//   - Tags (e.g., "Patient", "Clear Explanation", "Well Prepared")
//
// Parameters:
//   - reviewerID: ID of user creating the review
//   - req: Review request with session ID, rating, comment, tags
//
// Returns:
//   - *ReviewResponse: Created review with all details
//   - error: If validation fails, duplicate review, or database error
//
// Example:
//   review, err := reviewService.CreateReview(userID, &CreateReviewRequest{
//     SessionID: 123,
//     Rating: 5,
//     Comment: "Great teacher!",
//     Tags: []string{"Patient", "Knowledgeable"},
//   })
func (s *ReviewService) CreateReview(reviewerID uint, req *dto.CreateReviewRequest) (*dto.ReviewResponse, error) {
	// VALIDATION: Ensure rating is within valid range (1-5 stars)
	if req.Rating < 1 || req.Rating > 5 {
		return nil, errors.New("rating must be between 1 and 5")
	}

	// FETCH SESSION: Get session details to verify it exists and is completed
	session, err := s.sessionRepo.GetByID(req.SessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// STATUS CHECK: Only allow reviews for completed sessions
	// This ensures both parties have actually completed the session
	if session.Status != models.StatusCompleted {
		return nil, errors.New("can only review completed sessions")
	}

	// ROLE DETERMINATION: Identify reviewer role and who is being reviewed
	// Teacher reviewing student vs Student reviewing teacher
	var reviewType models.ReviewType
	var revieweeID uint

	if session.TeacherID == reviewerID {
		// Teacher is reviewing the student (learner)
		reviewType = models.ReviewTypeStudent
		revieweeID = session.StudentID
	} else if session.StudentID == reviewerID {
		// Student is reviewing the teacher (tutor)
		reviewType = models.ReviewTypeTeacher
		revieweeID = session.TeacherID
	} else {
		// Neither teacher nor student - unauthorized
		return nil, errors.New("only session participants can review")
	}

	// DUPLICATE CHECK: Prevent multiple reviews from same reviewer for same session
	existingReview, _ := s.reviewRepo.GetBySessionAndReviewer(req.SessionID, reviewerID)
	if existingReview != nil && existingReview.ID > 0 {
		return nil, errors.New("you have already reviewed this session")
	}

	// CREATE REVIEW: Build review object with all provided data
	review := &models.Review{
		SessionID:           req.SessionID,
		ReviewerID:          reviewerID,
		RevieweeID:          revieweeID,
		Type:                reviewType,
		Rating:              req.Rating,
		Comment:             req.Comment,
		Tags:                req.Tags,
		CommunicationRating: req.CommunicationRating,
		PunctualityRating:   req.PunctualityRating,
		KnowledgeRating:     req.KnowledgeRating,
	}

	// PERSIST: Save review to database
	if err := s.reviewRepo.Create(review); err != nil {
		return nil, fmt.Errorf("failed to create review: %w", err)
	}

	// RELOAD: Fetch review with relationships for response
	review, err = s.reviewRepo.GetByID(review.ID)
	if err != nil {
		return nil, err
	}

	// Send review notification to reviewee
	reviewer, _ := s.userRepo.GetByID(reviewerID)
	notificationData := map[string]interface{}{
		"reviewID":   review.ID,
		"rating":     req.Rating,
		"reviewerName": reviewer.FullName,
	}
	_, _ = s.notificationService.CreateNotification(
		revieweeID,
		models.NotificationTypeReview,
		"New Review Received! ⭐",
		fmt.Sprintf("%s gave you a %d-star review", reviewer.FullName, req.Rating),
		notificationData,
	)

	return dto.MapReviewToResponse(review), nil
}

// GetReview gets a specific review by ID
func (s *ReviewService) GetReview(id uint) (*dto.ReviewResponse, error) {
	review, err := s.reviewRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get review: %w", err)
	}
	return dto.MapReviewToResponse(review), nil
}

// GetReviewsForUser gets all reviews for a user
func (s *ReviewService) GetReviewsForUser(userID uint, limit, offset int) ([]dto.ReviewResponse, int64, error) {
	// Validate pagination
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	reviews, total, err := s.reviewRepo.GetReviewsForUser(userID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get reviews: %w", err)
	}

	return dto.MapReviewsToResponse(reviews), total, nil
}

// GetReviewsForUserByType gets reviews for a user filtered by type
func (s *ReviewService) GetReviewsForUserByType(userID uint, reviewType string, limit, offset int) ([]dto.ReviewResponse, int64, error) {
	// Validate pagination
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	// Validate review type
	var rType models.ReviewType
	if reviewType == "teacher" {
		rType = models.ReviewTypeTeacher
	} else if reviewType == "student" {
		rType = models.ReviewTypeStudent
	} else {
		return nil, 0, errors.New("invalid review type")
	}

	reviews, total, err := s.reviewRepo.GetReviewsForUserByType(userID, rType, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get reviews: %w", err)
	}

	return dto.MapReviewsToResponse(reviews), total, nil
}

// GetUserRatingSummary gets comprehensive rating summary for a user
// Calculates overall rating and breaks down by role (as teacher vs as student)
func (s *ReviewService) GetUserRatingSummary(userID uint) (map[string]interface{}, error) {
	// FETCH OVERALL RATING: Get average rating across all reviews
	avgRating, err := s.reviewRepo.GetAverageRatingForUser(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get average rating: %w", err)
	}

	// FETCH TOTAL COUNT: Get total number of reviews received
	count, err := s.reviewRepo.GetRatingCountForUser(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get rating count: %w", err)
	}

	// FETCH TEACHER REVIEWS: Get all reviews where user was teaching
	// These are reviews from students about the user's teaching ability
	teacherReviews, _, err := s.reviewRepo.GetReviewsForUserByType(userID, models.ReviewTypeTeacher, 1000, 0)
	if err != nil {
		return nil, err
	}

	// FETCH STUDENT REVIEWS: Get all reviews where user was learning
	// These are reviews from teachers about the user's learning behavior
	studentReviews, _, err := s.reviewRepo.GetReviewsForUserByType(userID, models.ReviewTypeStudent, 1000, 0)
	if err != nil {
		return nil, err
	}

	// CALCULATE ROLE-BASED AVERAGES: Compute separate ratings for each role
	// This allows users to see how they're perceived as a teacher vs learner
	avgTeacherRating := calculateAverageRating(teacherReviews)
	avgStudentRating := calculateAverageRating(studentReviews)

	// BUILD RESPONSE: Return comprehensive rating breakdown
	return map[string]interface{}{
		"average_rating":          avgRating,          // Overall average rating
		"total_reviews":           count,              // Total reviews received
		"average_teacher_rating":  avgTeacherRating,   // Average rating as teacher
		"teacher_review_count":    len(teacherReviews), // Number of teaching reviews
		"average_student_rating":  avgStudentRating,   // Average rating as student
		"student_review_count":    len(studentReviews), // Number of student reviews
	}, nil
}

// UpdateReview updates a review (only by reviewer or admin)
func (s *ReviewService) UpdateReview(reviewID, userID uint, req *dto.UpdateReviewRequest) (*dto.ReviewResponse, error) {
	// Get review
	review, err := s.reviewRepo.GetByID(reviewID)
	if err != nil {
		return nil, errors.New("review not found")
	}

	// Verify ownership
	if review.ReviewerID != userID {
		return nil, errors.New("you can only edit your own reviews")
	}

	// Update fields
	if req.Rating > 0 {
		if req.Rating < 1 || req.Rating > 5 {
			return nil, errors.New("rating must be between 1 and 5")
		}
		review.Rating = req.Rating
	}

	if req.Comment != "" {
		review.Comment = req.Comment
	}

	if req.Tags != "" {
		review.Tags = req.Tags
	}

	if req.CommunicationRating != nil {
		review.CommunicationRating = req.CommunicationRating
	}

	if req.PunctualityRating != nil {
		review.PunctualityRating = req.PunctualityRating
	}

	if req.KnowledgeRating != nil {
		review.KnowledgeRating = req.KnowledgeRating
	}

	// Save
	if err := s.reviewRepo.Update(review); err != nil {
		return nil, fmt.Errorf("failed to update review: %w", err)
	}

	// Reload
	review, err = s.reviewRepo.GetByID(reviewID)
	if err != nil {
		return nil, err
	}

	return dto.MapReviewToResponse(review), nil
}

// DeleteReview deletes a review (soft delete)
func (s *ReviewService) DeleteReview(reviewID, userID uint) error {
	// Get review
	review, err := s.reviewRepo.GetByID(reviewID)
	if err != nil {
		return errors.New("review not found")
	}

	// Verify ownership
	if review.ReviewerID != userID {
		return errors.New("you can only delete your own reviews")
	}

	// Delete
	return s.reviewRepo.Delete(reviewID)
}

// Helper function to calculate average rating from reviews
func calculateAverageRating(reviews []models.Review) float64 {
	if len(reviews) == 0 {
		return 0
	}

	sum := 0
	for _, review := range reviews {
		sum += review.Rating
	}

	return float64(sum) / float64(len(reviews))
}
