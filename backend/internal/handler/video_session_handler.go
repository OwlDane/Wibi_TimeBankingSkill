package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// VideoSessionHandler handles video session HTTP requests
type VideoSessionHandler struct {
	videoSessionService *service.VideoSessionService
}

// NewVideoSessionHandler creates a new video session handler
func NewVideoSessionHandler(videoSessionService *service.VideoSessionService) *VideoSessionHandler {
	return &VideoSessionHandler{videoSessionService: videoSessionService}
}

// StartVideoSession starts a new video session
// POST /api/v1/sessions/:id/video/start
func (h *VideoSessionHandler) StartVideoSession(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid session ID", err)
		return
	}

	response, err := h.videoSessionService.StartVideoSession(userID.(uint), uint(sessionID))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "Video session started successfully", response)
}

// EndVideoSession ends a video session
// POST /api/v1/sessions/:id/video/end
func (h *VideoSessionHandler) EndVideoSession(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid session ID", err)
		return
	}

	var req dto.EndVideoSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	response, err := h.videoSessionService.EndVideoSession(userID.(uint), uint(sessionID), req.Duration)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Video session ended successfully", response)
}

// GetVideoSessionStatus gets the status of a video session
// GET /api/v1/sessions/:id/video/status
func (h *VideoSessionHandler) GetVideoSessionStatus(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid session ID", err)
		return
	}

	response, err := h.videoSessionService.GetVideoSessionStatus(userID.(uint), uint(sessionID))
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Video session status retrieved successfully", response)
}

// GetVideoHistory gets video call history for the current user
// GET /api/v1/user/video-history
func (h *VideoSessionHandler) GetVideoHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
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

	history, total, err := h.videoSessionService.GetVideoHistory(userID.(uint), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch video history", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Video history retrieved successfully",
		"data": gin.H{
			"history": history,
			"total":   total,
			"limit":   limit,
			"offset":  offset,
		},
	})
}

// GetVideoStats gets video session statistics for the current user
// GET /api/v1/user/video-stats
func (h *VideoSessionHandler) GetVideoStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	stats, err := h.videoSessionService.GetVideoStats(userID.(uint))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch video stats", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Video statistics retrieved successfully", stats)
}
