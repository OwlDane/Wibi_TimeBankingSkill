package service

import (
	"errors"
	"fmt"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
	"github.com/timebankingskill/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

// AdminService handles admin business logic
type AdminService struct {
	adminRepo *repository.AdminRepository
}

// NewAdminService creates new admin service
func NewAdminService(adminRepo *repository.AdminRepository) *AdminService {
	return &AdminService{
		adminRepo: adminRepo,
	}
}

// Register registers a new admin (only super_admin can do this)
func (s *AdminService) Register(req dto.AdminRegisterRequest) (*dto.AdminLoginResponse, error) {
	// Check if admin already exists
	existing, _ := s.adminRepo.GetByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("admin with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create admin
	admin := models.Admin{
		Email:    req.Email,
		Password: string(hashedPassword),
		FullName: req.FullName,
		Role:     req.Role,
		IsActive: true,
	}

	if err := s.adminRepo.Create(&admin); err != nil {
		return nil, fmt.Errorf("failed to create admin: %w", err)
	}

	// Generate token
	token, err := utils.GenerateToken(admin.ID, admin.Email, "admin")
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &dto.AdminLoginResponse{
		Token: token,
		Admin: dto.AdminProfile{
			ID:       admin.ID,
			Email:    admin.Email,
			FullName: admin.FullName,
			Role:     admin.Role,
			IsActive: admin.IsActive,
			CreatedAt: admin.CreatedAt,
		},
	}, nil
}

// Login logs in an admin
func (s *AdminService) Login(req dto.AdminLoginRequest) (*dto.AdminLoginResponse, error) {
	// Get admin by email
	admin, err := s.adminRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Check if admin is active
	if !admin.IsActive {
		return nil, errors.New("admin account is inactive")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Update last login
	s.adminRepo.UpdateLastLogin(admin.ID)

	// Generate token
	token, err := utils.GenerateToken(admin.ID, admin.Email, "admin")
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &dto.AdminLoginResponse{
		Token: token,
		Admin: dto.AdminProfile{
			ID:        admin.ID,
			Email:     admin.Email,
			FullName:  admin.FullName,
			Role:      admin.Role,
			IsActive:  admin.IsActive,
			LastLogin: admin.LastLogin,
			CreatedAt: admin.CreatedAt,
		},
	}, nil
}

// GetProfile gets admin profile
func (s *AdminService) GetProfile(adminID uint) (*dto.AdminProfile, error) {
	admin, err := s.adminRepo.GetByID(adminID)
	if err != nil {
		return nil, errors.New("admin not found")
	}

	return &dto.AdminProfile{
		ID:        admin.ID,
		Email:     admin.Email,
		FullName:  admin.FullName,
		Role:      admin.Role,
		IsActive:  admin.IsActive,
		LastLogin: admin.LastLogin,
		CreatedAt: admin.CreatedAt,
	}, nil
}

// UpdateProfile updates admin profile
func (s *AdminService) UpdateProfile(adminID uint, req dto.AdminUpdateRequest) (*dto.AdminProfile, error) {
	admin, err := s.adminRepo.GetByID(adminID)
	if err != nil {
		return nil, errors.New("admin not found")
	}

	// Update fields
	if req.FullName != "" {
		admin.FullName = req.FullName
	}
	if req.Email != "" {
		// Check if email already exists
		existing, _ := s.adminRepo.GetByEmail(req.Email)
		if existing != nil && existing.ID != adminID {
			return nil, errors.New("email already in use")
		}
		admin.Email = req.Email
	}

	if err := s.adminRepo.Update(admin); err != nil {
		return nil, fmt.Errorf("failed to update admin: %w", err)
	}

	return &dto.AdminProfile{
		ID:        admin.ID,
		Email:     admin.Email,
		FullName:  admin.FullName,
		Role:      admin.Role,
		IsActive:  admin.IsActive,
		LastLogin: admin.LastLogin,
		CreatedAt: admin.CreatedAt,
	}, nil
}

// ChangePassword changes admin password
func (s *AdminService) ChangePassword(adminID uint, req dto.AdminChangePasswordRequest) error {
	admin, err := s.adminRepo.GetByID(adminID)
	if err != nil {
		return errors.New("admin not found")
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.OldPassword)); err != nil {
		return errors.New("old password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	admin.Password = string(hashedPassword)
	return s.adminRepo.Update(admin)
}
