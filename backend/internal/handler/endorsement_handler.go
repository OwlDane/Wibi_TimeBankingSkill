package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// EndorsementHandler handles endorsement HTTP requests
type EndorsementHandler struct {
	endorsementService *service.EndorsementService
}

// NewEndorsementHandler creates a new endorsement handler
func NewEndorsementHandler(endorsementService *service.EndorsementService) *EndorsementHandler {
	return &EndorsementHandler{endorsementService: endorsementService}
}

// CreateEndorsement creates a new endorsement
func (h *EndorsementHandler) CreateEndorsement(c *gin.Context) {
	endorserID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var req dto.CreateEndorsementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	endorsement, err := h.endorsementService.CreateEndorsement(endorserID.(uint), &req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "Endorsement created successfully", endorsement)
}

// GetEndorsementsForUser gets all endorsements for a user
func (h *EndorsementHandler) GetEndorsementsForUser(c *gin.Context) {
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

	endorsements, total, err := h.endorsementService.GetEndorsementsForUser(uint(userID), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch endorsements", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Endorsements fetched successfully",
		"data": gin.H{
			"endorsements": endorsements,
			"total":        total,
			"limit":        limit,
			"offset":       offset,
		},
	})
}

// GetEndorsementsForSkill gets endorsements for a specific skill
func (h *EndorsementHandler) GetEndorsementsForSkill(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	skillID, err := strconv.ParseUint(c.Param("skill_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
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

	endorsements, total, err := h.endorsementService.GetEndorsementsForSkill(uint(userID), uint(skillID), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch endorsements", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Endorsements fetched successfully",
		"data": gin.H{
			"endorsements": endorsements,
			"total":        total,
			"limit":        limit,
			"offset":       offset,
		},
	})
}

// GetEndorsementCount gets count of endorsements for a skill
func (h *EndorsementHandler) GetEndorsementCount(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	skillID, err := strconv.ParseUint(c.Param("skill_id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	count, err := h.endorsementService.GetEndorsementCount(uint(userID), uint(skillID))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch count", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Count fetched successfully", gin.H{
		"count": count,
	})
}

// DeleteEndorsement deletes an endorsement
func (h *EndorsementHandler) DeleteEndorsement(c *gin.Context) {
	endorserID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	endorsementID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid endorsement ID", err)
		return
	}

	if err := h.endorsementService.DeleteEndorsement(uint(endorsementID), endorserID.(uint)); err != nil {
		utils.SendError(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Endorsement deleted successfully", nil)
}

// GetTopEndorsedSkills gets the most endorsed skills
func (h *EndorsementHandler) GetTopEndorsedSkills(c *gin.Context) {
	limit := 10

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	skills, err := h.endorsementService.GetTopEndorsedSkills(limit)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch skills", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Top endorsed skills fetched successfully", skills)
}
