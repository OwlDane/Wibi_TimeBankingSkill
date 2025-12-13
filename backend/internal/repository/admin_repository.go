package repository

import (
	"github.com/timebankingskill/backend/internal/models"
	"gorm.io/gorm"
)

// AdminRepository handles admin data access
type AdminRepository struct {
	db *gorm.DB
}

// NewAdminRepository creates new admin repository
func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

// Create creates a new admin
func (r *AdminRepository) Create(admin *models.Admin) error {
	return r.db.Create(admin).Error
}

// GetByEmail gets admin by email
func (r *AdminRepository) GetByEmail(email string) (*models.Admin, error) {
	var admin models.Admin
	err := r.db.Where("email = ?", email).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

// GetByID gets admin by ID
func (r *AdminRepository) GetByID(id uint) (*models.Admin, error) {
	var admin models.Admin
	err := r.db.Where("id = ?", id).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

// GetAll gets all admins
func (r *AdminRepository) GetAll() ([]models.Admin, error) {
	var admins []models.Admin
	err := r.db.Where("deleted_at IS NULL").Find(&admins).Error
	return admins, err
}

// Update updates admin
func (r *AdminRepository) Update(admin *models.Admin) error {
	return r.db.Save(admin).Error
}

// Delete soft deletes admin
func (r *AdminRepository) Delete(id uint) error {
	return r.db.Model(&models.Admin{}).Where("id = ?", id).Update("deleted_at", gorm.Expr("NOW()")).Error
}

// UpdateLastLogin updates last login timestamp
func (r *AdminRepository) UpdateLastLogin(id uint) error {
	return r.db.Model(&models.Admin{}).Where("id = ?", id).Update("last_login", gorm.Expr("NOW()")).Error
}

// IsActive checks if admin is active
func (r *AdminRepository) IsActive(id uint) (bool, error) {
	var admin models.Admin
	err := r.db.Select("is_active").Where("id = ?", id).First(&admin).Error
	if err != nil {
		return false, err
	}
	return admin.IsActive, nil
}
