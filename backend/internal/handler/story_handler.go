package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// StoryHandler handles success story HTTP requests
type StoryHandler struct {
	storyService *service.StoryService
}

// NewStoryHandler creates a new story handler
func NewStoryHandler(storyService *service.StoryService) *StoryHandler {
	return &StoryHandler{storyService: storyService}
}

// ===== STORY ENDPOINTS =====

// CreateStory creates a new success story
func (h *StoryHandler) CreateStory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req dto.CreateStoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	story, err := h.storyService.CreateStory(userID.(uint), &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "Story created successfully", story)
}

// GetStory gets a story by ID
func (h *StoryHandler) GetStory(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid story ID", err)
		return
	}

	story, err := h.storyService.GetStoryByID(uint(id))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "Story not found", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Story fetched successfully", story)
}

// GetPublishedStories gets all published stories
func (h *StoryHandler) GetPublishedStories(c *gin.Context) {
	limit := 10
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	stories, total, err := h.storyService.GetPublishedStories(limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch stories", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Stories fetched successfully",
		"data": gin.H{
			"stories": stories,
			"total":   total,
			"limit":   limit,
			"offset":  offset,
		},
	})
}

// GetUserStories gets stories by a user
func (h *StoryHandler) GetUserStories(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	limit := 10
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	stories, total, err := h.storyService.GetStoriesByUser(uint(userID), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch stories", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Stories fetched successfully",
		"data": gin.H{
			"stories": stories,
			"total":   total,
			"limit":   limit,
			"offset":  offset,
		},
	})
}

// UpdateStory updates a story
func (h *StoryHandler) UpdateStory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	storyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid story ID", err)
		return
	}

	var req dto.UpdateStoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	story, err := h.storyService.UpdateStory(uint(storyID), userID.(uint), &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Story updated successfully", story)
}

// DeleteStory deletes a story
func (h *StoryHandler) DeleteStory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	storyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid story ID", err)
		return
	}

	if err := h.storyService.DeleteStory(uint(storyID), userID.(uint)); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Story deleted successfully", nil)
}

// ===== COMMENT ENDPOINTS =====

// CreateComment creates a new story comment
func (h *StoryHandler) CreateComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req dto.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	comment, err := h.storyService.CreateComment(userID.(uint), &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "Comment created successfully", comment)
}

// GetComments gets comments for a story
func (h *StoryHandler) GetComments(c *gin.Context) {
	storyID, err := strconv.ParseUint(c.Param("story_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid story ID", err)
		return
	}

	limit := 10
	offset := 0

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	comments, total, err := h.storyService.GetCommentsByStory(uint(storyID), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch comments", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Comments fetched successfully",
		"data": gin.H{
			"comments": comments,
			"total":    total,
			"limit":    limit,
			"offset":   offset,
		},
	})
}

// DeleteComment deletes a comment
func (h *StoryHandler) DeleteComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid comment ID", err)
		return
	}

	if err := h.storyService.DeleteComment(uint(commentID), userID.(uint)); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Comment deleted successfully", nil)
}

// LikeStory likes a story
func (h *StoryHandler) LikeStory(c *gin.Context) {
	storyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid story ID", err)
		return
	}

	if err := h.storyService.LikeStory(uint(storyID)); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Story liked successfully", nil)
}

// UnlikeStory unlikes a story
func (h *StoryHandler) UnlikeStory(c *gin.Context) {
	storyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid story ID", err)
		return
	}

	if err := h.storyService.UnlikeStory(uint(storyID)); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Story unliked successfully", nil)
}
