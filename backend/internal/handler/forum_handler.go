package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// ForumHandler handles forum HTTP requests
type ForumHandler struct {
	forumService *service.ForumService
}

// NewForumHandler creates a new forum handler
func NewForumHandler(forumService *service.ForumService) *ForumHandler {
	return &ForumHandler{forumService: forumService}
}

// ===== CATEGORY ENDPOINTS =====

// GetCategories gets all forum categories
func (h *ForumHandler) GetCategories(c *gin.Context) {
	categories, err := h.forumService.GetAllCategories()
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch categories", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Categories fetched successfully", categories)
}

// ===== THREAD ENDPOINTS =====

// CreateThread creates a new forum thread
func (h *ForumHandler) CreateThread(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req dto.CreateThreadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	thread, err := h.forumService.CreateThread(userID.(uint), &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "Thread created successfully", thread)
}

// GetThread gets a thread by ID
func (h *ForumHandler) GetThread(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid thread ID", err)
		return
	}

	thread, err := h.forumService.GetThreadByID(uint(id))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "Thread not found", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Thread fetched successfully", thread)
}

// GetThreadsByCategory gets threads in a category
func (h *ForumHandler) GetThreadsByCategory(c *gin.Context) {
	categoryID, err := strconv.ParseUint(c.Param("category_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid category ID", err)
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

	threads, total, err := h.forumService.GetThreadsByCategory(uint(categoryID), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch threads", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Threads fetched successfully",
		"data": gin.H{
			"threads": threads,
			"total":   total,
			"limit":   limit,
			"offset":  offset,
		},
	})
}

// UpdateThread updates a thread
func (h *ForumHandler) UpdateThread(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	threadID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid thread ID", err)
		return
	}

	var req dto.UpdateThreadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	thread, err := h.forumService.UpdateThread(uint(threadID), userID.(uint), &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Thread updated successfully", thread)
}

// ===== REPLY ENDPOINTS =====

// CreateReply creates a new forum reply
func (h *ForumHandler) CreateReply(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req dto.CreateReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	reply, err := h.forumService.CreateReply(userID.(uint), &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "Reply created successfully", reply)
}

// GetReplies gets replies for a thread
func (h *ForumHandler) GetReplies(c *gin.Context) {
	threadID, err := strconv.ParseUint(c.Param("thread_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid thread ID", err)
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

	replies, total, err := h.forumService.GetRepliesByThread(uint(threadID), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch replies", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Replies fetched successfully",
		"data": gin.H{
			"replies": replies,
			"total":   total,
			"limit":   limit,
			"offset":  offset,
		},
	})
}

// DeleteReply deletes a reply
func (h *ForumHandler) DeleteReply(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	replyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid reply ID", err)
		return
	}

	if err := h.forumService.DeleteReply(uint(replyID), userID.(uint)); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Reply deleted successfully", nil)
}
