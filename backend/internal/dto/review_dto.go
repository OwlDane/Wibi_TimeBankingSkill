package dto

import (
	"github.com/timebankingskill/backend/internal/models"
)

// CreateReviewRequest represents a request to create a review
type CreateReviewRequest struct {
	SessionID           uint    `json:"session_id" binding:"required"`
	Rating              int     `json:"rating" binding:"required,min=1,max=5"`
	Comment             string  `json:"comment"`
	Tags                string  `json:"tags"` // Comma-separated or JSON
	CommunicationRating *int    `json:"communication_rating" binding:"omitempty,min=1,max=5"`
	PunctualityRating   *int    `json:"punctuality_rating" binding:"omitempty,min=1,max=5"`
	KnowledgeRating     *int    `json:"knowledge_rating" binding:"omitempty,min=1,max=5"`
}

// UpdateReviewRequest represents a request to update a review
type UpdateReviewRequest struct {
	Rating              int     `json:"rating" binding:"omitempty,min=1,max=5"`
	Comment             string  `json:"comment"`
	Tags                string  `json:"tags"`
	CommunicationRating *int    `json:"communication_rating" binding:"omitempty,min=1,max=5"`
	PunctualityRating   *int    `json:"punctuality_rating" binding:"omitempty,min=1,max=5"`
	KnowledgeRating     *int    `json:"knowledge_rating" binding:"omitempty,min=1,max=5"`
}

// ReviewResponse represents a review in API responses
type ReviewResponse struct {
	ID                  uint                `json:"id"`
	SessionID           uint                `json:"session_id"`
	ReviewerID          uint                `json:"reviewer_id"`
	RevieweeID          uint                `json:"reviewee_id"`
	Type                string              `json:"type"`
	Rating              int                 `json:"rating"`
	Comment             string              `json:"comment"`
	Tags                string              `json:"tags"`
	CommunicationRating *int                `json:"communication_rating"`
	PunctualityRating   *int                `json:"punctuality_rating"`
	KnowledgeRating     *int                `json:"knowledge_rating"`
	HelpfulCount        int                 `json:"helpful_count"`
	IsReported          bool                `json:"is_reported"`
	IsHidden            bool                `json:"is_hidden"`
	Reviewer            *UserProfileResponse `json:"reviewer,omitempty"`
	Reviewee            *UserProfileResponse `json:"reviewee,omitempty"`
	CreatedAt           string              `json:"created_at"`
	UpdatedAt           string              `json:"updated_at"`
}

// ReviewListResponse represents a list of reviews
type ReviewListResponse struct {
	Reviews []ReviewResponse `json:"reviews"`
	Total   int64            `json:"total"`
	Limit   int              `json:"limit"`
	Offset  int              `json:"offset"`
}

// MapReviewToResponse maps a Review model to ReviewResponse
func MapReviewToResponse(review *models.Review) *ReviewResponse {
	resp := &ReviewResponse{
		ID:                  review.ID,
		SessionID:           review.SessionID,
		ReviewerID:          review.ReviewerID,
		RevieweeID:          review.RevieweeID,
		Type:                string(review.Type),
		Rating:              review.Rating,
		Comment:             review.Comment,
		Tags:                review.Tags,
		CommunicationRating: review.CommunicationRating,
		PunctualityRating:   review.PunctualityRating,
		KnowledgeRating:     review.KnowledgeRating,
		HelpfulCount:        review.HelpfulCount,
		IsReported:          review.IsReported,
		IsHidden:            review.IsHidden,
		CreatedAt:           review.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:           review.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	// Map reviewer
	if review.Reviewer.ID > 0 {
		resp.Reviewer = &UserProfileResponse{
			ID:       review.Reviewer.ID,
			Username: review.Reviewer.Username,
			FullName: review.Reviewer.FullName,
			Avatar:   review.Reviewer.Avatar,
		}
	}

	// Map reviewee
	if review.Reviewee.ID > 0 {
		resp.Reviewee = &UserProfileResponse{
			ID:       review.Reviewee.ID,
			Username: review.Reviewee.Username,
			FullName: review.Reviewee.FullName,
			Avatar:   review.Reviewee.Avatar,
		}
	}

	return resp
}

// MapReviewsToResponse maps a slice of Review models to ReviewResponse
func MapReviewsToResponse(reviews []models.Review) []ReviewResponse {
	responses := make([]ReviewResponse, len(reviews))
	for i, review := range reviews {
		resp := MapReviewToResponse(&review)
		responses[i] = *resp
	}
	return responses
}
