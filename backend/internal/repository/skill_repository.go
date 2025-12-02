package repository

import (
  "errors"

  "github.com/timebankingskill/backend/internal/models"
  "gorm.io/gorm"
)

// SkillRepositoryInterface defines the contract for skill repository
type SkillRepositoryInterface interface {
  GetAllWithFilters(limit, offset int, category, search string) ([]models.Skill, int64, error)
  GetByID(id uint) (*models.Skill, error)
  Create(skill *models.Skill) error
  Update(skill *models.Skill) error
  Delete(id uint) error
  
  // User Skills
  CreateUserSkill(userSkill *models.UserSkill) error
  GetUserSkills(userID uint) ([]models.UserSkill, error)
  GetUserSkill(userID, skillID uint) (*models.UserSkill, error)
  UpdateUserSkill(userSkill *models.UserSkill) error
  DeleteUserSkill(userID, skillID uint) error
  
  // Learning Skills
  CreateLearningSkill(learningSkill *models.LearningSkill) error
  GetLearningSkills(userID uint) ([]models.LearningSkill, error)
  GetLearningSkill(userID, skillID uint) (*models.LearningSkill, error)
  DeleteLearningSkill(userID, skillID uint) error
}

// SkillRepository handles database operations for skills
type SkillRepository struct {
  db *gorm.DB
}

// NewSkillRepository creates a new skill repository
func NewSkillRepository(db *gorm.DB) *SkillRepository {
  return &SkillRepository{db: db}
}

// FindAll returns all skills
func (r *SkillRepository) FindAll() ([]models.Skill, error) {
  var skills []models.Skill
  err := r.db.Find(&skills).Error
  return skills, err
}

// FindByID finds a skill by ID
func (r *SkillRepository) FindByID(id uint) (*models.Skill, error) {
  var skill models.Skill
  err := r.db.First(&skill, id).Error
  if err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
      return nil, errors.New("skill not found")
    }
    return nil, err
  }
  return &skill, nil
}

// FindByCategory finds skills by category
func (r *SkillRepository) FindByCategory(category models.SkillCategory) ([]models.Skill, error) {
  var skills []models.Skill
  err := r.db.Where("category = ?", category).Find(&skills).Error
  return skills, err
}

// Search searches skills by name
func (r *SkillRepository) Search(query string) ([]models.Skill, error) {
  var skills []models.Skill
  err := r.db.Where("name ILIKE ?", "%"+query+"%").Find(&skills).Error
  return skills, err
}

// Create creates a new skill
func (r *SkillRepository) Create(skill *models.Skill) error {
  return r.db.Create(skill).Error
}

// GetAllWithFilters returns skills with pagination and filters
func (r *SkillRepository) GetAllWithFilters(limit, offset int, category, search string) ([]models.Skill, int64, error) {
  var skills []models.Skill
  var total int64
  
  query := r.db.Model(&models.Skill{})
  
  // Apply filters
  if category != "" {
    query = query.Where("category = ?", category)
  }
  if search != "" {
    query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
  }
  
  // Count total
  err := query.Count(&total).Error
  if err != nil {
    return nil, 0, err
  }
  
  // Apply pagination and get results
  err = query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&skills).Error
  return skills, total, err
}

// GetByID finds a skill by ID
func (r *SkillRepository) GetByID(id uint) (*models.Skill, error) {
  var skill models.Skill
  err := r.db.First(&skill, id).Error
  if err != nil {
    return nil, err
  }
  return &skill, nil
}

// Update updates an existing skill
func (r *SkillRepository) Update(skill *models.Skill) error {
  return r.db.Save(skill).Error
}

// Delete deletes a skill
func (r *SkillRepository) Delete(id uint) error {
  return r.db.Delete(&models.Skill{}, id).Error
}

// User Skills Methods

// CreateUserSkill creates a new user skill
func (r *SkillRepository) CreateUserSkill(userSkill *models.UserSkill) error {
  return r.db.Create(userSkill).Error
}

// GetUserSkills returns all skills that user can teach
func (r *SkillRepository) GetUserSkills(userID uint) ([]models.UserSkill, error) {
  var userSkills []models.UserSkill
  err := r.db.Preload("Skill").Where("user_id = ?", userID).Find(&userSkills).Error
  return userSkills, err
}

// GetUserSkill returns specific user skill
func (r *SkillRepository) GetUserSkill(userID, skillID uint) (*models.UserSkill, error) {
  var userSkill models.UserSkill
  err := r.db.Where("user_id = ? AND skill_id = ?", userID, skillID).First(&userSkill).Error
  if err != nil {
    return nil, err
  }
  return &userSkill, nil
}

// UpdateUserSkill updates user skill
func (r *SkillRepository) UpdateUserSkill(userSkill *models.UserSkill) error {
  return r.db.Save(userSkill).Error
}

// DeleteUserSkill deletes user skill
func (r *SkillRepository) DeleteUserSkill(userID, skillID uint) error {
  return r.db.Where("user_id = ? AND skill_id = ?", userID, skillID).Delete(&models.UserSkill{}).Error
}

// Learning Skills Methods

// CreateLearningSkill adds skill to learning wishlist
func (r *SkillRepository) CreateLearningSkill(learningSkill *models.LearningSkill) error {
  return r.db.Create(learningSkill).Error
}

// GetLearningSkills returns user's learning wishlist
func (r *SkillRepository) GetLearningSkills(userID uint) ([]models.LearningSkill, error) {
  var learningSkills []models.LearningSkill
  err := r.db.Preload("Skill").Where("user_id = ?", userID).Find(&learningSkills).Error
  return learningSkills, err
}

// GetLearningSkill returns specific learning skill
func (r *SkillRepository) GetLearningSkill(userID, skillID uint) (*models.LearningSkill, error) {
  var learningSkill models.LearningSkill
  err := r.db.Where("user_id = ? AND skill_id = ?", userID, skillID).First(&learningSkill).Error
  if err != nil {
    return nil, err
  }
  return &learningSkill, nil
}

// DeleteLearningSkill removes skill from learning wishlist
func (r *SkillRepository) DeleteLearningSkill(userID, skillID uint) error {
  return r.db.Where("user_id = ? AND skill_id = ?", userID, skillID).Delete(&models.LearningSkill{}).Error
}
