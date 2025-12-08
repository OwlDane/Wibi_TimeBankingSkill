package dto

import "gorm.io/datatypes"

// UploadFileRequest represents a file upload request
type UploadFileRequest struct {
	SessionID   uint   `form:"session_id" binding:"required"`
	Description string `form:"description"`
	IsPublic    bool   `form:"is_public"`
}

// SharedFileResponse represents a shared file in API responses
type SharedFileResponse struct {
	ID          uint                `json:"id"`
	SessionID   uint                `json:"session_id"`
	UploaderID  uint                `json:"uploader_id"`
	Uploader    *UserPublicProfile  `json:"uploader,omitempty"`
	FileName    string              `json:"file_name"`
	FileSize    int64               `json:"file_size"`
	FileType    string              `json:"file_type"`
	FileURL     string              `json:"file_url"`
	Description string              `json:"description"`
	IsPublic    bool                `json:"is_public"`
	Metadata    datatypes.JSONMap   `json:"metadata,omitempty"`
	CreatedAt   int64               `json:"created_at"`
	UpdatedAt   int64               `json:"updated_at"`
}

// GetSessionFilesResponse represents files for a session
type GetSessionFilesResponse struct {
	SessionID uint                  `json:"session_id"`
	Files     []SharedFileResponse  `json:"files"`
	Count     int                   `json:"count"`
}

// DeleteFileRequest represents a file deletion request
type DeleteFileRequest struct {
	FileID uint `json:"file_id" binding:"required"`
}
