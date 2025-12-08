package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// SharedFileHandler handles file sharing requests
type SharedFileHandler struct {
	service *service.SharedFileService
}

// NewSharedFileHandler creates a new shared file handler
func NewSharedFileHandler(service *service.SharedFileService) *SharedFileHandler {
	return &SharedFileHandler{service: service}
}

// UploadFile uploads a file to a session
// POST /api/v1/sessions/:id/files/upload
func (h *SharedFileHandler) UploadFile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	sessionID := c.Param("id")
	sessionIDUint, err := strconv.ParseUint(sessionID, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid session ID", err)
		return
	}

	// Get file from request
	file, err := c.FormFile("file")
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "File is required", err)
		return
	}

	description := c.PostForm("description")
	isPublic := c.PostForm("is_public") == "true"

	// Upload file
	response, err := h.service.UploadFile(
		userID.(uint),
		uint(sessionIDUint),
		file,
		description,
		isPublic,
	)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Failed to upload file", err)
		return
	}

	utils.SendSuccess(c, http.StatusCreated, "File uploaded successfully", response)
}

// GetSessionFiles gets all files for a session
// GET /api/v1/sessions/:id/files
func (h *SharedFileHandler) GetSessionFiles(c *gin.Context) {
	sessionID := c.Param("id")
	sessionIDUint, err := strconv.ParseUint(sessionID, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid session ID", err)
		return
	}

	response, err := h.service.GetSessionFiles(uint(sessionIDUint))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to retrieve files", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Files retrieved successfully", response)
}

// GetFile gets a single file
// GET /api/v1/files/:id
func (h *SharedFileHandler) GetFile(c *gin.Context) {
	fileID := c.Param("id")
	fileIDUint, err := strconv.ParseUint(fileID, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid file ID", err)
		return
	}

	response, err := h.service.GetFile(uint(fileIDUint))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "File not found", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "File retrieved successfully", response)
}

// DeleteFile deletes a file
// DELETE /api/v1/files/:id
func (h *SharedFileHandler) DeleteFile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	fileID := c.Param("id")
	fileIDUint, err := strconv.ParseUint(fileID, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid file ID", err)
		return
	}

	if err := h.service.DeleteFile(userID.(uint), uint(fileIDUint)); err != nil {
		utils.SendError(c, http.StatusBadRequest, "Failed to delete file", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "File deleted successfully", nil)
}

// GetSessionFileStats gets file statistics for a session
// GET /api/v1/sessions/:id/files/stats
func (h *SharedFileHandler) GetSessionFileStats(c *gin.Context) {
	sessionID := c.Param("id")
	sessionIDUint, err := strconv.ParseUint(sessionID, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid session ID", err)
		return
	}

	stats, err := h.service.GetSessionFileStats(uint(sessionIDUint))
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to retrieve statistics", err)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "File statistics retrieved successfully", stats)
}
