package repository

import (
  "errors"

  "github.com/timebankingskill/backend/internal/models"
  "gorm.io/gorm"
)

// UserRepositoryInterface defines the contract for user repository
type UserRepositoryInterface interface {
  Create(user *models.User) error
  GetByID(id uint) (*models.User, error)
  GetByEmail(email string) (*models.User, error)
  GetByUsername(username string) (*models.User, error)
  Update(user *models.User) error
  Delete(id uint) error
}

// UserRepository handles database operations for users
type UserRepository struct {
  db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
  return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
  return r.db.Create(user).Error
}

// GetByID finds a user by ID (implements interface)
func (r *UserRepository) GetByID(id uint) (*models.User, error) {
  var user models.User
  err := r.db.First(&user, id).Error
  if err != nil {
    return nil, err
  }
  return &user, nil
}

// FindByID finds a user by ID (legacy method)
func (r *UserRepository) FindByID(id uint) (*models.User, error) {
  return r.GetByID(id)
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
  var user models.User
  err := r.db.Where("email = ?", email).First(&user).Error
  if err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
      return nil, errors.New("user not found")
    }
    return nil, err
  }
  return &user, nil
}

// GetByEmail finds a user by email (implements interface)
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
  var user models.User
  err := r.db.Where("email = ?", email).First(&user).Error
  if err != nil {
    return nil, err
  }
  return &user, nil
}

// GetByUsername finds a user by username (implements interface)
func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
  var user models.User
  err := r.db.Where("username = ?", username).First(&user).Error
  if err != nil {
    return nil, err
  }
  return &user, nil
}

// FindByUsername finds a user by username (legacy method)
func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
  return r.GetByUsername(username)
}

// Update updates a user
func (r *UserRepository) Update(user *models.User) error {
  return r.db.Save(user).Error
}

// Delete soft deletes a user
func (r *UserRepository) Delete(id uint) error {
  return r.db.Delete(&models.User{}, id).Error
}

// EmailExists checks if email already exists
func (r *UserRepository) EmailExists(email string) (bool, error) {
  var count int64
  err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error
  return count > 0, err
}

// UsernameExists checks if username already exists
func (r *UserRepository) UsernameExists(username string) (bool, error) {
  var count int64
  err := r.db.Model(&models.User{}).Where("username = ?", username).Count(&count).Error
  return count > 0, err
}

// GetWithRelations gets user with all relations
func (r *UserRepository) GetWithRelations(id uint) (*models.User, error) {
  var user models.User
  err := r.db.Preload("TeachingSkills").
    Preload("TeachingSkills.Skill").
    Preload("LearningSkills").
    Preload("LearningSkills.Skill").
    Preload("UserBadges").
    Preload("UserBadges.Badge").
    First(&user, id).Error
  
  if err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
      return nil, errors.New("user not found")
    }
    return nil, err
  }
  return &user, nil
}

// UpdateCreditBalance updates user's credit balance
func (r *UserRepository) UpdateCreditBalance(userID uint, amount float64) error {
  return r.db.Model(&models.User{}).
    Where("id = ?", userID).
    Update("credit_balance", gorm.Expr("credit_balance + ?", amount)).
    Error
}

// IncrementStats increments user statistics
func (r *UserRepository) IncrementStats(userID uint, field string, value int) error {
  return r.db.Model(&models.User{}).
    Where("id = ?", userID).
    Update(field, gorm.Expr(field+" + ?", value)).
    Error
}
