package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// AvailabilityHandler handles availability-related HTTP requests
type AvailabilityHandler struct {
	availabilityService *service.AvailabilityService
}

// NewAvailabilityHandler creates a new availability handler
func NewAvailabilityHandler(availabilityService *service.AvailabilityService) *AvailabilityHandler {
	return &AvailabilityHandler{availabilityService: availabilityService}
}

// GetMyAvailability handles GET /api/v1/user/availability
// Retrieves the authenticated user's availability schedule
func (h *AvailabilityHandler) GetMyAvailability(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	availability, err := h.availabilityService.GetUserAvailability(userID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Availability retrieved successfully", availability)
}

// SetMyAvailability handles PUT /api/v1/user/availability
// Sets the authenticated user's availability schedule (replaces existing)
func (h *AvailabilityHandler) SetMyAvailability(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req dto.SetAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	availability, err := h.availabilityService.SetUserAvailability(userID, &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Availability updated successfully", availability)
}

// ClearMyAvailability handles DELETE /api/v1/user/availability
// Clears all availability for the authenticated user
func (h *AvailabilityHandler) ClearMyAvailability(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	if err := h.availabilityService.ClearUserAvailability(userID); err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to clear availability", nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Availability cleared successfully", nil)
}

// GetUserAvailability handles GET /api/v1/users/:id/availability
// Retrieves another user's availability (public endpoint)
func (h *AvailabilityHandler) GetUserAvailability(c *gin.Context) {
	userIDParam := c.Param("id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	availability, err := h.availabilityService.GetUserAvailability(uint(userID))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Availability retrieved successfully", availability)
}

// CheckAvailability handles GET /api/v1/users/:id/availability/check
// Checks if a user is available at a specific day and time
func (h *AvailabilityHandler) CheckAvailability(c *gin.Context) {
	userIDParam := c.Param("id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	dayOfWeekStr := c.Query("day")
	dayOfWeek, err := strconv.Atoi(dayOfWeekStr)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid day parameter", err)
		return
	}

	timeStr := c.Query("time")
	if timeStr == "" {
		utils.SendError(c, http.StatusBadRequest, "time parameter is required", nil)
		return
	}

	isAvailable, err := h.availabilityService.CheckUserAvailability(uint(userID), dayOfWeek, timeStr)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Availability checked", map[string]interface{}{
		"user_id":      userID,
		"day_of_week":  dayOfWeek,
		"time":         timeStr,
		"is_available": isAvailable,
	})
}
