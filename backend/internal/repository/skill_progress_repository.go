package repository

import (
	"errors"

	"github.com/timebankingskill/backend/internal/models"
	"gorm.io/gorm"
)

// SkillProgressRepository handles data access for skill progress
type SkillProgressRepository struct {
	db *gorm.DB
}

// NewSkillProgressRepository creates a new skill progress repository
func NewSkillProgressRepository(db *gorm.DB) *SkillProgressRepository {
	return &SkillProgressRepository{db: db}
}

// GetByUserAndSkill gets progress for a user's skill
func (r *SkillProgressRepository) GetByUserAndSkill(userID, skillID uint) (*models.SkillProgress, error) {
	var progress models.SkillProgress
	if err := r.db.
		Preload("Skill").
		Where("user_id = ? AND skill_id = ?", userID, skillID).
		First(&progress).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("progress not found")
		}
		return nil, err
	}
	return &progress, nil
}

// GetByUserID gets all progress for a user
func (r *SkillProgressRepository) GetByUserID(userID uint) ([]models.SkillProgress, error) {
	var progresses []models.SkillProgress
	if err := r.db.
		Preload("Skill").
		Where("user_id = ?", userID).
		Order("updated_at DESC").
		Find(&progresses).Error; err != nil {
		return nil, err
	}
	return progresses, nil
}

// Create creates a new skill progress record
func (r *SkillProgressRepository) Create(progress *models.SkillProgress) error {
	return r.db.Create(progress).Error
}

// Update updates skill progress
func (r *SkillProgressRepository) Update(progress *models.SkillProgress) error {
	return r.db.Save(progress).Error
}

// Delete deletes skill progress
func (r *SkillProgressRepository) Delete(userID, skillID uint) error {
	return r.db.Where("user_id = ? AND skill_id = ?", userID, skillID).Delete(&models.SkillProgress{}).Error
}

// GetMilestones gets milestones for a skill progress
func (r *SkillProgressRepository) GetMilestones(progressID uint) ([]models.Milestone, error) {
	var milestones []models.Milestone
	if err := r.db.
		Where("skill_progress_id = ?", progressID).
		Order("progress_threshold ASC").
		Find(&milestones).Error; err != nil {
		return nil, err
	}
	return milestones, nil
}

// CreateMilestone creates a new milestone
func (r *SkillProgressRepository) CreateMilestone(milestone *models.Milestone) error {
	return r.db.Create(milestone).Error
}

// UpdateMilestone updates a milestone
func (r *SkillProgressRepository) UpdateMilestone(milestone *models.Milestone) error {
	return r.db.Save(milestone).Error
}

// GetAverageProgress gets average progress for a user
func (r *SkillProgressRepository) GetAverageProgress(userID uint) (float64, error) {
	var avgProgress float64
	if err := r.db.
		Model(&models.SkillProgress{}).
		Where("user_id = ?", userID).
		Select("COALESCE(AVG(progress_percentage), 0)").
		Scan(&avgProgress).Error; err != nil {
		return 0, err
	}
	return avgProgress, nil
}

// GetTotalHoursSpent gets total hours spent by a user
func (r *SkillProgressRepository) GetTotalHoursSpent(userID uint) (float64, error) {
	var totalHours float64
	if err := r.db.
		Model(&models.SkillProgress{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(total_hours_spent), 0)").
		Scan(&totalHours).Error; err != nil {
		return 0, err
	}
	return totalHours, nil
}
