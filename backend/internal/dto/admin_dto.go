package dto

import "time"

// AdminLoginRequest represents admin login request
type AdminLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// AdminLoginResponse represents admin login response
type AdminLoginResponse struct {
	Token string       `json:"token"`
	Admin AdminProfile `json:"admin"`
}

// AdminProfile represents admin profile info
type AdminProfile struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	LastLogin *time.Time `json:"last_login"`
	CreatedAt time.Time `json:"created_at"`
}

// AdminRegisterRequest represents admin registration request (for super_admin only)
type AdminRegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=admin super_admin moderator"`
}

// AdminUpdateRequest represents admin update request
type AdminUpdateRequest struct {
	FullName string `json:"full_name"`
	Email    string `json:"email" binding:"email"`
}

// AdminChangePasswordRequest represents password change request
type AdminChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}
