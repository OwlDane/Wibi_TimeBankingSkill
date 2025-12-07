package dto

import "github.com/timebankingskill/backend/internal/models"

// ===== FORUM THREAD DTOs =====

// CreateThreadRequest is the request to create a forum thread
type CreateThreadRequest struct {
	CategoryID uint            `json:"category_id" binding:"required"`
	Title      string          `json:"title" binding:"required,min=3,max=200"`
	Content    string          `json:"content" binding:"required,min=10"`
	Tags       models.JSONArray `json:"tags"`
}

// UpdateThreadRequest is the request to update a forum thread
type UpdateThreadRequest struct {
	Title   string           `json:"title" binding:"required,min=3,max=200"`
	Content string           `json:"content" binding:"required,min=10"`
	Tags    models.JSONArray `json:"tags"`
}

// ThreadResponse is the response for a forum thread
type ThreadResponse struct {
	ID         uint                   `json:"id"`
	CategoryID uint                   `json:"category_id"`
	Category   *ForumCategoryResponse `json:"category,omitempty"`
	AuthorID   uint                   `json:"author_id"`
	Author     *UserProfileResponse   `json:"author,omitempty"`
	Title      string                 `json:"title"`
	Content    string                 `json:"content"`
	Tags       models.JSONArray       `json:"tags"`
	ViewCount  int                    `json:"view_count"`
	ReplyCount int                    `json:"reply_count"`
	IsPinned   bool                   `json:"is_pinned"`
	IsClosed   bool                   `json:"is_closed"`
	CreatedAt  string                 `json:"created_at"`
	UpdatedAt  string                 `json:"updated_at"`
}

// ===== FORUM REPLY DTOs =====

// CreateReplyRequest is the request to create a forum reply
type CreateReplyRequest struct {
	ThreadID uint   `json:"thread_id" binding:"required"`
	Content  string `json:"content" binding:"required,min=1"`
}

// ReplyResponse is the response for a forum reply
type ReplyResponse struct {
	ID        uint                 `json:"id"`
	ThreadID  uint                 `json:"thread_id"`
	AuthorID  uint                 `json:"author_id"`
	Author    *UserProfileResponse `json:"author,omitempty"`
	Content   string               `json:"content"`
	LikeCount int                  `json:"like_count"`
	CreatedAt string               `json:"created_at"`
	UpdatedAt string               `json:"updated_at"`
}

// ===== FORUM CATEGORY DTOs =====

// ForumCategoryResponse is the response for a forum category
type ForumCategoryResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	ThreadCount int    `json:"thread_count"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// ===== SUCCESS STORY DTOs =====

// CreateStoryRequest is the request to create a success story
type CreateStoryRequest struct {
	Title       string           `json:"title" binding:"required,min=3,max=200"`
	Description string           `json:"description" binding:"required,min=10"`
	Images      models.JSONArray `json:"images"`
	Tags        models.JSONArray `json:"tags"`
	IsPublished bool             `json:"is_published"`
}

// UpdateStoryRequest is the request to update a success story
type UpdateStoryRequest struct {
	Title       string           `json:"title" binding:"required,min=3,max=200"`
	Description string           `json:"description" binding:"required,min=10"`
	Images      models.JSONArray `json:"images"`
	Tags        models.JSONArray `json:"tags"`
	IsPublished bool             `json:"is_published"`
}

// StoryResponse is the response for a success story
type StoryResponse struct {
	ID           uint                 `json:"id"`
	UserID       uint                 `json:"user_id"`
	User         *UserProfileResponse `json:"user,omitempty"`
	Title        string               `json:"title"`
	Description  string               `json:"description"`
	Images       models.JSONArray     `json:"images"`
	Tags         models.JSONArray     `json:"tags"`
	LikeCount    int                  `json:"like_count"`
	CommentCount int                  `json:"comment_count"`
	IsPublished  bool                 `json:"is_published"`
	CreatedAt    string               `json:"created_at"`
	UpdatedAt    string               `json:"updated_at"`
}

// ===== STORY COMMENT DTOs =====

// CreateCommentRequest is the request to create a story comment
type CreateCommentRequest struct {
	StoryID uint   `json:"story_id" binding:"required"`
	Content string `json:"content" binding:"required,min=1"`
}

// CommentResponse is the response for a story comment
type CommentResponse struct {
	ID        uint                 `json:"id"`
	StoryID   uint                 `json:"story_id"`
	AuthorID  uint                 `json:"author_id"`
	Author    *UserProfileResponse `json:"author,omitempty"`
	Content   string               `json:"content"`
	LikeCount int                  `json:"like_count"`
	CreatedAt string               `json:"created_at"`
	UpdatedAt string               `json:"updated_at"`
}

// ===== ENDORSEMENT DTOs =====

// CreateEndorsementRequest is the request to create an endorsement
type CreateEndorsementRequest struct {
	UserID  uint   `json:"user_id" binding:"required"`
	SkillID uint   `json:"skill_id" binding:"required"`
	Message string `json:"message"`
}

// EndorsementResponse is the response for an endorsement
type EndorsementResponse struct {
	ID         uint                 `json:"id"`
	UserID     uint                 `json:"user_id"`
	User       *UserProfileResponse `json:"user,omitempty"`
	SkillID    uint                 `json:"skill_id"`
	Skill      interface{}          `json:"skill,omitempty"`
	EndorserID uint                 `json:"endorser_id"`
	Endorser   *UserProfileResponse `json:"endorser,omitempty"`
	Message    string               `json:"message"`
	CreatedAt  string               `json:"created_at"`
	UpdatedAt  string               `json:"updated_at"`
}
