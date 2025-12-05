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

type SkillHandler struct {
	skillService *service.SkillService
}

func NewSkillHandler(skillService *service.SkillService) *SkillHandler {
	return &SkillHandler{
		skillService: skillService,
	}
}

// GetSkills handles GET /api/v1/skills
// Implements caching for frequently accessed data
func (h *SkillHandler) GetSkills(c *gin.Context) {
	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "10")
	pageStr := c.DefaultQuery("page", "1")
	category := c.Query("category")
	search := c.Query("search")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 10
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	offset := (page - 1) * limit

	// Try to get from cache if no search/filter
	cache := utils.GetCache()
	if search == "" && category == "" && page == 1 {
		if cached, found := cache.Get(utils.CacheKeySkills); found {
			utils.SendSuccess(c, http.StatusOK, "Skills retrieved from cache", cached)
			return
		}
	}

	// Get skills from service
	skills, total, err := h.skillService.GetAllSkills(limit, offset, category, search)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch skills", err)
		return
	}

	// Convert to response DTOs
	skillResponses := make([]dto.SkillResponse, len(skills))
	for i, skill := range skills {
		skillResponses[i] = dto.ToSkillResponse(&skill)
	}

	response := dto.SkillListResponse{
		Skills: skillResponses,
		Total:  total,
		Page:   page,
		Limit:  limit,
	}

	// Cache response if no search/filter and page 1
	if search == "" && category == "" && page == 1 {
		cache.Set(utils.CacheKeySkills, response)
	}

	utils.SendSuccess(c, http.StatusOK, "Skills retrieved successfully", response)
}

// GetSkillByID handles GET /api/v1/skills/:id
func (h *SkillHandler) GetSkillByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	skill, err := h.skillService.GetSkillByID(uint(id))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "Skill not found", err)
		return
	}

	response := dto.ToSkillResponse(skill)
	utils.SendSuccess(c, http.StatusOK, "Skill retrieved successfully", response)
}

// GetSkillTeachers handles GET /api/v1/skills/:id/teachers
func (h *SkillHandler) GetSkillTeachers(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	teachers, err := h.skillService.GetSkillTeachers(uint(id))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch teachers", err)
		return
	}

	// Convert to response DTOs
	responses := make([]dto.UserSkillResponse, len(teachers))
	for i, t := range teachers {
		responses[i] = dto.ToUserSkillResponse(&t)
	}

	utils.SendSuccess(c, http.StatusOK, "Teachers retrieved successfully", responses)
}

// CreateSkill handles POST /api/v1/skills (admin only)
func (h *SkillHandler) CreateSkill(c *gin.Context) {
	var req dto.CreateSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	skill := &models.Skill{
		Name:        req.Name,
		Category:    models.SkillCategory(req.Category),
		Description: req.Description,
		Icon:        req.Icon,
	}

	err := h.skillService.CreateSkill(skill)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Failed to create skill", err)
		return
	}

	response := dto.ToSkillResponse(skill)
	utils.SendSuccess(c, http.StatusCreated, "Skill created successfully", response)
}

// UpdateSkill handles PUT /api/v1/skills/:id (admin only)
func (h *SkillHandler) UpdateSkill(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	var req dto.UpdateSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	updates := &models.Skill{
		Name:        req.Name,
		Category:    models.SkillCategory(req.Category),
		Description: req.Description,
		Icon:        req.Icon,
	}

	err = h.skillService.UpdateSkill(uint(id), updates)
	if err != nil {
		if err.Error() == "skill not found" {
			utils.SendError(c, http.StatusNotFound, "Skill not found", err)
			return
		}
		utils.SendError(c, http.StatusBadRequest, "Failed to update skill", err)
		return
	}

	// Get updated skill
	updatedSkill, _ := h.skillService.GetSkillByID(uint(id))
	response := dto.ToSkillResponse(updatedSkill)
	utils.SendSuccess(c, http.StatusOK, "Skill updated successfully", response)
}

// DeleteSkill handles DELETE /api/v1/skills/:id (admin only)
func (h *SkillHandler) DeleteSkill(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	err = h.skillService.DeleteSkill(uint(id))
	if err != nil {
		if err.Error() == "skill not found" {
			utils.SendError(c, http.StatusNotFound, "Skill not found", err)
			return
		}
		utils.SendError(c, http.StatusBadRequest, "Failed to delete skill", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Skill deleted successfully", nil)
}

// User Skills Handlers

// AddUserSkill handles POST /api/v1/user/skills
func (h *SkillHandler) AddUserSkill(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	var req dto.CreateUserSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	userSkill := &models.UserSkill{
		SkillID:           req.SkillID,
		Level:             models.SkillLevel(req.Level),
		Description:       req.Description,
		YearsOfExperience: req.YearsOfExperience,
		ProofURL:          req.ProofURL,
		ProofType:         req.ProofType,
		HourlyRate:        req.HourlyRate,
		OnlineOnly:        req.OnlineOnly,
		OfflineOnly:       req.OfflineOnly,
		IsAvailable:       req.IsAvailable,
	}

	err := h.skillService.AddUserSkill(userID.(uint), userSkill)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Failed to add skill", err)
		return
	}

	// Get created user skill with skill details
	createdSkill, _ := h.skillService.GetUserSkills(userID.(uint))
	var response dto.UserSkillResponse
	for _, us := range createdSkill {
		if us.SkillID == req.SkillID {
			response = dto.ToUserSkillResponse(&us)
			break
		}
	}

	utils.SendSuccess(c, http.StatusCreated, "Skill added successfully", response)
}

// GetUserSkills handles GET /api/v1/user/skills
func (h *SkillHandler) GetUserSkills(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userSkills, err := h.skillService.GetUserSkills(userID.(uint))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch user skills", err)
		return
	}

	// Convert to response DTOs
	responses := make([]dto.UserSkillResponse, len(userSkills))
	for i, userSkill := range userSkills {
		responses[i] = dto.ToUserSkillResponse(&userSkill)
	}

	utils.SendSuccess(c, http.StatusOK, "User skills retrieved successfully", responses)
}

// UpdateUserSkill handles PUT /api/v1/user/skills/:skillId
func (h *SkillHandler) UpdateUserSkill(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	skillIDStr := c.Param("skillId")
	skillID, err := strconv.ParseUint(skillIDStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	var req dto.UpdateUserSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	updates := &models.UserSkill{
		Level:             models.SkillLevel(req.Level),
		Description:       req.Description,
		YearsOfExperience: req.YearsOfExperience,
		ProofURL:          req.ProofURL,
		ProofType:         req.ProofType,
		HourlyRate:        req.HourlyRate,
		OnlineOnly:        req.OnlineOnly,
		OfflineOnly:       req.OfflineOnly,
	}

	if req.IsAvailable != nil {
		updates.IsAvailable = *req.IsAvailable
	}

	err = h.skillService.UpdateUserSkill(userID.(uint), uint(skillID), updates)
	if err != nil {
		if err.Error() == "user skill not found" {
			utils.SendError(c, http.StatusNotFound, "User skill not found", err)
			return
		}
		utils.SendError(c, http.StatusBadRequest, "Failed to update skill", err)
		return
	}

	// Get updated user skill
	userSkills, _ := h.skillService.GetUserSkills(userID.(uint))
	var response dto.UserSkillResponse
	for _, us := range userSkills {
		if us.SkillID == uint(skillID) {
			response = dto.ToUserSkillResponse(&us)
			break
		}
	}

	utils.SendSuccess(c, http.StatusOK, "Skill updated successfully", response)
}

// DeleteUserSkill handles DELETE /api/v1/user/skills/:skillId
func (h *SkillHandler) DeleteUserSkill(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	skillIDStr := c.Param("skillId")
	skillID, err := strconv.ParseUint(skillIDStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	err = h.skillService.DeleteUserSkill(userID.(uint), uint(skillID))
	if err != nil {
		if err.Error() == "user skill not found" {
			utils.SendError(c, http.StatusNotFound, "User skill not found", err)
			return
		}
		utils.SendError(c, http.StatusBadRequest, "Failed to delete skill", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Skill removed successfully", nil)
}

// Learning Skills Handlers

// AddLearningSkill handles POST /api/v1/user/learning-skills
func (h *SkillHandler) AddLearningSkill(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	var req dto.CreateLearningSkillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	learningSkill := &models.LearningSkill{
		SkillID:      req.SkillID,
		DesiredLevel: models.SkillLevel(req.DesiredLevel),
		Priority:     req.Priority,
		Notes:        req.Notes,
	}

	err := h.skillService.AddLearningSkill(userID.(uint), learningSkill)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Failed to add learning skill", err)
		return
	}

	// Get created learning skill with skill details
	createdSkills, _ := h.skillService.GetLearningSkills(userID.(uint))
	var response dto.LearningSkillResponse
	for _, ls := range createdSkills {
		if ls.SkillID == req.SkillID {
			response = dto.ToLearningSkillResponse(&ls)
			break
		}
	}

	utils.SendSuccess(c, http.StatusCreated, "Learning skill added successfully", response)
}

// GetLearningSkills handles GET /api/v1/user/learning-skills
func (h *SkillHandler) GetLearningSkills(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	learningSkills, err := h.skillService.GetLearningSkills(userID.(uint))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch learning skills", err)
		return
	}

	// Convert to response DTOs
	responses := make([]dto.LearningSkillResponse, len(learningSkills))
	for i, learningSkill := range learningSkills {
		responses[i] = dto.ToLearningSkillResponse(&learningSkill)
	}

	utils.SendSuccess(c, http.StatusOK, "Learning skills retrieved successfully", responses)
}

// DeleteLearningSkill handles DELETE /api/v1/user/learning-skills/:skillId
func (h *SkillHandler) DeleteLearningSkill(c *gin.Context) {
	// Get user ID from JWT
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	skillIDStr := c.Param("skillId")
	skillID, err := strconv.ParseUint(skillIDStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid skill ID", err)
		return
	}

	err = h.skillService.DeleteLearningSkill(userID.(uint), uint(skillID))
	if err != nil {
		if err.Error() == "learning skill not found" {
			utils.SendError(c, http.StatusNotFound, "Learning skill not found", err)
			return
		}
		utils.SendError(c, http.StatusBadRequest, "Failed to remove learning skill", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Learning skill removed successfully", nil)
}
