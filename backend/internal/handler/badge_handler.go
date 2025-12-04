package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// BadgeHandler handles badge-related HTTP requests
type BadgeHandler struct {
	badgeService *service.BadgeService
}

// NewBadgeHandler creates a new badge handler
func NewBadgeHandler(badgeService *service.BadgeService) *BadgeHandler {
	return &BadgeHandler{
		badgeService: badgeService,
	}
}

// GetAllBadges retrieves all available badges
// GET /api/v1/badges
func (h *BadgeHandler) GetAllBadges(c *gin.Context) {
	badges, err := h.badgeService.GetAllBadges()
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch badges", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Badges retrieved successfully", gin.H{
		"badges": badges,
		"total":  len(badges),
	})
}

// GetBadge retrieves a specific badge by ID
// GET /api/v1/badges/:id
func (h *BadgeHandler) GetBadge(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid badge ID", err)
		return
	}

	badge, err := h.badgeService.GetBadge(uint(id))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "Badge not found", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Badge retrieved successfully", badge)
}

// GetUserBadges retrieves all badges earned by the current user
// GET /api/v1/user/badges
func (h *BadgeHandler) GetUserBadges(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	badges, err := h.badgeService.GetUserBadges(userID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch user badges", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "User badges retrieved successfully", gin.H{
		"badges": badges,
		"total":  len(badges),
	})
}

// GetUserBadgesByType retrieves user badges filtered by type
// GET /api/v1/user/badges/:type
func (h *BadgeHandler) GetUserBadgesByType(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	badgeType := c.Param("type")
	if badgeType == "" {
		utils.SendError(c, http.StatusBadRequest, "Badge type is required", nil)
		return
	}

	badges, err := h.badgeService.GetUserBadgesByType(userID, badgeType)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "User badges retrieved successfully", gin.H{
		"badges": badges,
		"total":  len(badges),
	})
}

// CheckAndAwardBadges checks if user qualifies for any badges and awards them
// POST /api/v1/user/badges/check
func (h *BadgeHandler) CheckAndAwardBadges(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	awardedBadges, err := h.badgeService.CheckAndAwardBadges(userID)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to check badges", err)
		return
	}

	if len(awardedBadges) > 0 {
		utils.SendSuccess(c, http.StatusOK, "New badges awarded!", gin.H{
			"awarded_badges": awardedBadges,
			"count":          len(awardedBadges),
		})
	} else {
		utils.SendSuccess(c, http.StatusOK, "No new badges earned", gin.H{
			"awarded_badges": []interface{}{},
			"count":          0,
		})
	}
}

// PinBadge pins/unpins a badge for the user
// POST /api/v1/user/badges/:id/pin
func (h *BadgeHandler) PinBadge(c *gin.Context) {
	_, ok := getUserID(c)
	if !ok {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	badgeIDStr := c.Param("id")
	_, err := strconv.ParseUint(badgeIDStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid badge ID", err)
		return
	}

	var req struct {
		IsPinned bool `json:"is_pinned"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	// TODO: Implement pin badge logic in service
	utils.SendSuccess(c, http.StatusOK, "Badge pin status updated", nil)
}

// GetBadgeLeaderboard retrieves top users by badge count
// GET /api/v1/leaderboard/badges?limit=10
func (h *BadgeHandler) GetBadgeLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	leaderboard, err := h.badgeService.GetBadgeLeaderboard(limit)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch leaderboard", err)
		return
	}

	// Add rank
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	utils.SendSuccess(c, http.StatusOK, "Badge leaderboard retrieved successfully", gin.H{
		"type":    "badges",
		"entries": leaderboard,
		"total":   len(leaderboard),
	})
}

// GetRarityLeaderboard retrieves top users by badge rarity
// GET /api/v1/leaderboard/rarity?limit=10
func (h *BadgeHandler) GetRarityLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	leaderboard, err := h.badgeService.GetRarityLeaderboard(limit)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch leaderboard", err)
		return
	}

	// Add rank
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	utils.SendSuccess(c, http.StatusOK, "Rarity leaderboard retrieved successfully", gin.H{
		"type":    "rarity",
		"entries": leaderboard,
		"total":   len(leaderboard),
	})
}

// GetSessionLeaderboard retrieves top users by session count
// GET /api/v1/leaderboard/sessions?limit=10
func (h *BadgeHandler) GetSessionLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	leaderboard, err := h.badgeService.GetSessionLeaderboard(limit)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch leaderboard", err)
		return
	}

	// Add rank
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	utils.SendSuccess(c, http.StatusOK, "Session leaderboard retrieved successfully", gin.H{
		"type":    "sessions",
		"entries": leaderboard,
		"total":   len(leaderboard),
	})
}

// GetRatingLeaderboard retrieves top users by average rating
// GET /api/v1/leaderboard/rating?limit=10
func (h *BadgeHandler) GetRatingLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	leaderboard, err := h.badgeService.GetRatingLeaderboard(limit)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch leaderboard", err)
		return
	}

	// Add rank
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	utils.SendSuccess(c, http.StatusOK, "Rating leaderboard retrieved successfully", gin.H{
		"type":    "rating",
		"entries": leaderboard,
		"total":   len(leaderboard),
	})
}

// GetCreditLeaderboard retrieves top users by credits earned
// GET /api/v1/leaderboard/credits?limit=10
func (h *BadgeHandler) GetCreditLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	leaderboard, err := h.badgeService.GetCreditLeaderboard(limit)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch leaderboard", err)
		return
	}

	// Add rank
	for i := range leaderboard {
		leaderboard[i].Rank = i + 1
	}

	utils.SendSuccess(c, http.StatusOK, "Credit leaderboard retrieved successfully", gin.H{
		"type":    "credits",
		"entries": leaderboard,
		"total":   len(leaderboard),
	})
}
