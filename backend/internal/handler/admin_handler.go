package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// AdminHandler handles admin HTTP requests
type AdminHandler struct {
	adminService *service.AdminService
}

// NewAdminHandler creates new admin handler
func NewAdminHandler(adminService *service.AdminService) *AdminHandler {
	return &AdminHandler{
		adminService: adminService,
	}
}

// Register registers a new admin (only super_admin)
// POST /api/v1/admin/register
func (h *AdminHandler) Register(c *gin.Context) {
	var req dto.AdminRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	response, err := h.adminService.Register(req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Registration failed", err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "Admin registered successfully", response)
}

// Login logs in an admin
// POST /api/v1/admin/login
func (h *AdminHandler) Login(c *gin.Context) {
	var req dto.AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	response, err := h.adminService.Login(req)
	if err != nil {
		utils.SendError(c, http.StatusUnauthorized, "Login failed", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Login successful", response)
}

// GetProfile gets admin profile
// GET /api/v1/admin/profile
func (h *AdminHandler) GetProfile(c *gin.Context) {
	adminID := c.GetUint("user_id")
	if adminID == 0 {
		utils.SendError(c, http.StatusUnauthorized, "Admin not authenticated", nil)
		return
	}

	profile, err := h.adminService.GetProfile(adminID)
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "Admin not found", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Profile retrieved successfully", profile)
}

// UpdateProfile updates admin profile
// PUT /api/v1/admin/profile
func (h *AdminHandler) UpdateProfile(c *gin.Context) {
	adminID := c.GetUint("user_id")
	if adminID == 0 {
		utils.SendError(c, http.StatusUnauthorized, "Admin not authenticated", nil)
		return
	}

	var req dto.AdminUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	profile, err := h.adminService.UpdateProfile(adminID, req)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Update failed", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Profile updated successfully", profile)
}

// ChangePassword changes admin password
// POST /api/v1/admin/change-password
func (h *AdminHandler) ChangePassword(c *gin.Context) {
	adminID := c.GetUint("user_id")
	if adminID == 0 {
		utils.SendError(c, http.StatusUnauthorized, "Admin not authenticated", nil)
		return
	}

	var req dto.AdminChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	if err := h.adminService.ChangePassword(adminID, req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Password change failed", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Password changed successfully", nil)
}
