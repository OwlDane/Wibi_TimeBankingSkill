package repository

import (
	"time"

	"github.com/timebankingskill/backend/internal/models"
	"gorm.io/gorm"
)

// BadgeRepository handles database operations for badges
type BadgeRepository struct {
	db *gorm.DB
}

// NewBadgeRepository creates a new badge repository
func NewBadgeRepository(db *gorm.DB) *BadgeRepository {
	return &BadgeRepository{db: db}
}

// GetAllBadges gets all active badges
func (r *BadgeRepository) GetAllBadges() ([]models.Badge, error) {
	var badges []models.Badge
	err := r.db.Where("is_active = ?", true).Order("display_order ASC").Find(&badges).Error
	return badges, err
}

// GetBadgeByID gets a badge by ID
func (r *BadgeRepository) GetBadgeByID(id uint) (*models.Badge, error) {
	var badge models.Badge
	err := r.db.First(&badge, id).Error
	return &badge, err
}

// GetBadgesByType gets badges filtered by type
func (r *BadgeRepository) GetBadgesByType(badgeType models.BadgeType) ([]models.Badge, error) {
	var badges []models.Badge
	err := r.db.Where("type = ? AND is_active = ?", badgeType, true).Order("display_order ASC").Find(&badges).Error
	return badges, err
}

// CreateBadge creates a new badge
func (r *BadgeRepository) CreateBadge(badge *models.Badge) error {
	return r.db.Create(badge).Error
}

// UpdateBadge updates a badge
func (r *BadgeRepository) UpdateBadge(badge *models.Badge) error {
	return r.db.Save(badge).Error
}

// DeleteBadge deletes a badge (soft delete)
func (r *BadgeRepository) DeleteBadge(id uint) error {
	return r.db.Delete(&models.Badge{}, id).Error
}

// GetUserBadges gets all badges earned by a user
func (r *BadgeRepository) GetUserBadges(userID uint) ([]models.UserBadge, error) {
	var userBadges []models.UserBadge
	err := r.db.Preload("Badge").Where("user_id = ?", userID).Order("earned_at DESC").Find(&userBadges).Error
	return userBadges, err
}

// GetUserBadgesByType gets badges earned by a user filtered by type
func (r *BadgeRepository) GetUserBadgesByType(userID uint, badgeType models.BadgeType) ([]models.UserBadge, error) {
	var userBadges []models.UserBadge
	err := r.db.Preload("Badge").
		Joins("JOIN badges ON badges.id = user_badges.badge_id").
		Where("user_badges.user_id = ? AND badges.type = ?", userID, badgeType).
		Order("user_badges.earned_at DESC").
		Find(&userBadges).Error
	return userBadges, err
}

// GetUserBadgeByID gets a specific user badge
func (r *BadgeRepository) GetUserBadgeByID(id uint) (*models.UserBadge, error) {
	var userBadge models.UserBadge
	err := r.db.Preload("Badge").First(&userBadge, id).Error
	return &userBadge, err
}

// HasUserBadge checks if user has a specific badge
func (r *BadgeRepository) HasUserBadge(userID, badgeID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.UserBadge{}).
		Where("user_id = ? AND badge_id = ?", userID, badgeID).
		Count(&count).Error
	return count > 0, err
}

// AwardBadge awards a badge to a user
func (r *BadgeRepository) AwardBadge(userID, badgeID uint) (*models.UserBadge, error) {
	userBadge := &models.UserBadge{
		UserID:   userID,
		BadgeID:  badgeID,
		EarnedAt: time.Now(),
	}
	err := r.db.Create(userBadge).Error
	if err != nil {
		return nil, err
	}

	// Increment badge total awarded count
	_ = r.db.Model(&models.Badge{}).Where("id = ?", badgeID).Update("total_awarded", gorm.Expr("total_awarded + ?", 1))

	return userBadge, nil
}

// UpdateUserBadgeProgress updates progress for a user badge
func (r *BadgeRepository) UpdateUserBadgeProgress(userID, badgeID uint, progress int) error {
	return r.db.Model(&models.UserBadge{}).
		Where("user_id = ? AND badge_id = ?", userID, badgeID).
		Update("progress", progress).Error
}

// PinBadge pins/unpins a badge for a user
func (r *BadgeRepository) PinBadge(userID, badgeID uint, isPinned bool) error {
	return r.db.Model(&models.UserBadge{}).
		Where("user_id = ? AND badge_id = ?", userID, badgeID).
		Update("is_pinned", isPinned).Error
}

// GetUserPinnedBadges gets pinned badges for a user
func (r *BadgeRepository) GetUserPinnedBadges(userID uint) ([]models.UserBadge, error) {
	var userBadges []models.UserBadge
	err := r.db.Preload("Badge").
		Where("user_id = ? AND is_pinned = ?", userID, true).
		Order("earned_at DESC").
		Find(&userBadges).Error
	return userBadges, err
}

// GetBadgeLeaderboard gets top users by badge count
func (r *BadgeRepository) GetBadgeLeaderboard(limit int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	err := r.db.Model(&models.UserBadge{}).
		Select("user_id, COUNT(*) as badge_count").
		Group("user_id").
		Order("badge_count DESC").
		Limit(limit).
		Scan(&results).Error
	return results, err
}

// GetRarityLeaderboard gets top users by badge rarity
func (r *BadgeRepository) GetRarityLeaderboard(limit int) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	err := r.db.Model(&models.UserBadge{}).
		Select("user_badges.user_id, SUM(badges.rarity) as total_rarity").
		Joins("JOIN badges ON badges.id = user_badges.badge_id").
		Group("user_badges.user_id").
		Order("total_rarity DESC").
		Limit(limit).
		Scan(&results).Error
	return results, err
}

// GetUserBadgeCount gets total badge count for a user
func (r *BadgeRepository) GetUserBadgeCount(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.UserBadge{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
