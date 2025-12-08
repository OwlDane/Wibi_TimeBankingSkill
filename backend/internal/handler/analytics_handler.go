package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// AnalyticsHandler handles analytics requests
type AnalyticsHandler struct {
	service *service.AnalyticsService
}

// NewAnalyticsHandler creates a new analytics handler
func NewAnalyticsHandler(service *service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

// GetUserAnalytics gets analytics for current user
// GET /api/v1/analytics/user
func (h *AnalyticsHandler) GetUserAnalytics(c *gin.Context) {
	userID := c.GetUint("user_id")

	analytics, err := h.service.GetUserAnalytics(userID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to get user analytics", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "User analytics retrieved successfully", analytics)
}

// GetUserAnalyticsByID gets analytics for a specific user (admin only)
// GET /api/v1/analytics/user/:userId
func (h *AnalyticsHandler) GetUserAnalyticsByID(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	analytics, err := h.service.GetUserAnalytics(uint(userID))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "User not found", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "User analytics retrieved successfully", analytics)
}

// GetPlatformAnalytics gets platform-wide analytics (admin only)
// GET /api/v1/analytics/platform
func (h *AnalyticsHandler) GetPlatformAnalytics(c *gin.Context) {
	analytics, err := h.service.GetPlatformAnalytics()
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to get platform analytics", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Platform analytics retrieved successfully", analytics)
}

// GetSessionStatistics gets session statistics
// GET /api/v1/analytics/sessions
func (h *AnalyticsHandler) GetSessionStatistics(c *gin.Context) {
	stats, err := h.service.GetSessionStatistics()
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to get session statistics", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Session statistics retrieved successfully", stats)
}

// GetCreditStatistics gets credit statistics
// GET /api/v1/analytics/credits
func (h *AnalyticsHandler) GetCreditStatistics(c *gin.Context) {
	stats, err := h.service.GetCreditStatistics()
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to get credit statistics", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Credit statistics retrieved successfully", stats)
}
