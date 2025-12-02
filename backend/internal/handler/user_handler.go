package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetProfile handles GET /api/v1/user/profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	user, err := h.userService.GetUserProfile(userID.(uint))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "User not found", err)
		return
	}

	response := dto.ToUserProfileResponse(user)
	utils.SendSuccess(c, http.StatusOK, "Profile retrieved successfully", response)
}

// UpdateProfile handles PUT /api/v1/user/profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// Create updates model
	updates := &models.User{
		FullName:    req.FullName,
		Username:    req.Username,
		School:      req.School,
		Grade:       req.Grade,
		Major:       req.Major,
		Bio:         req.Bio,
		PhoneNumber: req.PhoneNumber,
		Location:    req.Location,
	}

	err := h.userService.UpdateUserProfile(userID.(uint), updates)
	if err != nil {
		if err.Error() == "username already taken" {
			utils.SendError(c, http.StatusConflict, "Username already taken", err)
			return
		}
		utils.SendError(c, http.StatusBadRequest, "Failed to update profile", err)
		return
	}

	// Get updated user profile
	updatedUser, _ := h.userService.GetUserProfile(userID.(uint))
	response := dto.ToUserProfileResponse(updatedUser)
	utils.SendSuccess(c, http.StatusOK, "Profile updated successfully", response)
}

// ChangePassword handles POST /api/v1/user/change-password
func (h *UserHandler) ChangePassword(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	err := h.userService.ChangePassword(userID.(uint), req.CurrentPassword, req.NewPassword)
	if err != nil {
		if err.Error() == "invalid current password" {
			utils.SendError(c, http.StatusBadRequest, "Invalid current password", err)
			return
		}
		utils.SendError(c, http.StatusBadRequest, "Failed to change password", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Password changed successfully", nil)
}

// GetStats handles GET /api/v1/user/stats
func (h *UserHandler) GetStats(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	stats, err := h.userService.GetUserStats(userID.(uint))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to get user stats", err)
		return
	}

	response := dto.UserStatsResponse{
		CreditBalance:         stats.CreditBalance,
		TotalCreditsEarned:   stats.TotalCreditsEarned,
		TotalCreditsSpent:    stats.TotalCreditsSpent,
		TotalSessionsAsTeacher: stats.TotalSessionsAsTeacher,
		TotalSessionsAsStudent: stats.TotalSessionsAsStudent,
		AverageRatingAsTeacher: stats.AverageRatingAsTeacher,
		AverageRatingAsStudent: stats.AverageRatingAsStudent,
		TotalTeachingHours:   stats.TotalTeachingHours,
		TotalLearningHours:   stats.TotalLearningHours,
	}
	utils.SendSuccess(c, http.StatusOK, "User stats retrieved successfully", response)
}

// UpdateAvatar handles POST /api/v1/user/avatar
func (h *UserHandler) UpdateAvatar(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	var req dto.UpdateAvatarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	err := h.userService.UpdateAvatar(userID.(uint), req.Avatar)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Failed to update avatar", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Avatar updated successfully", gin.H{"avatar": req.Avatar})
}

// GetPublicProfile handles GET /api/v1/users/:id/profile
func (h *UserHandler) GetPublicProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	profile, err := h.userService.GetPublicProfile(uint(id))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "User not found", err)
		return
	}

	response := dto.PublicProfileResponse{
		ID:                    profile.ID,
		FullName:             profile.FullName,
		Username:             profile.Username,
		School:               profile.School,
		Grade:                profile.Grade,
		Major:                profile.Major,
		Bio:                  profile.Bio,
		Avatar:               profile.Avatar,
		Location:             profile.Location,
		TotalSessionsAsTeacher: profile.TotalSessionsAsTeacher,
		AverageRatingAsTeacher: profile.AverageRatingAsTeacher,
		TotalTeachingHours:   profile.TotalTeachingHours,
		CreatedAt:            profile.CreatedAt,
	}
	utils.SendSuccess(c, http.StatusOK, "Public profile retrieved successfully", response)
}

// GetPublicProfileByUsername handles GET /api/v1/users/@:username
func (h *UserHandler) GetPublicProfileByUsername(c *gin.Context) {
	username := c.Param("username")
	if username == "" {
		utils.SendError(c, http.StatusBadRequest, "Username is required", nil)
		return
	}

	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "User not found", err)
		return
	}

	profile, err := h.userService.GetPublicProfile(user.ID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to get profile", err)
		return
	}

	response := dto.PublicProfileResponse{
		ID:                    profile.ID,
		FullName:             profile.FullName,
		Username:             profile.Username,
		School:               profile.School,
		Grade:                profile.Grade,
		Major:                profile.Major,
		Bio:                  profile.Bio,
		Avatar:               profile.Avatar,
		Location:             profile.Location,
		TotalSessionsAsTeacher: profile.TotalSessionsAsTeacher,
		AverageRatingAsTeacher: profile.AverageRatingAsTeacher,
		TotalTeachingHours:   profile.TotalTeachingHours,
		CreatedAt:            profile.CreatedAt,
	}
	utils.SendSuccess(c, http.StatusOK, "Public profile retrieved successfully", response)
}
