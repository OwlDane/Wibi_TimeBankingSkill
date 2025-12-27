package repository

import (
	"github.com/timebankingskill/backend/internal/models"
	"gorm.io/gorm"
)

// AvailabilityRepository handles database operations for availability
type AvailabilityRepository struct {
	db *gorm.DB
}

// NewAvailabilityRepository creates a new availability repository
func NewAvailabilityRepository(db *gorm.DB) *AvailabilityRepository {
	return &AvailabilityRepository{db: db}
}

// Create creates a new availability slot
func (r *AvailabilityRepository) Create(availability *models.Availability) error {
	return r.db.Create(availability).Error
}

// GetByID finds an availability slot by ID
func (r *AvailabilityRepository) GetByID(id uint) (*models.Availability, error) {
	var availability models.Availability
	err := r.db.First(&availability, id).Error
	if err != nil {
		return nil, err
	}
	return &availability, nil
}

// GetUserAvailability gets all availability slots for a user
func (r *AvailabilityRepository) GetUserAvailability(userID uint) ([]models.Availability, error) {
	var availabilities []models.Availability
	err := r.db.Where("user_id = ? AND is_active = ?", userID, true).
		Order("day_of_week ASC, start_time ASC").
		Find(&availabilities).Error
	return availabilities, err
}

// GetUserAvailabilityByDay gets availability for a specific day
func (r *AvailabilityRepository) GetUserAvailabilityByDay(userID uint, dayOfWeek int) ([]models.Availability, error) {
	var availabilities []models.Availability
	err := r.db.Where("user_id = ? AND day_of_week = ? AND is_active = ?", userID, dayOfWeek, true).
		Order("start_time ASC").
		Find(&availabilities).Error
	return availabilities, err
}

// Update updates an availability slot
func (r *AvailabilityRepository) Update(availability *models.Availability) error {
	return r.db.Save(availability).Error
}

// Delete soft deletes an availability slot
func (r *AvailabilityRepository) Delete(id uint) error {
	return r.db.Delete(&models.Availability{}, id).Error
}

// DeleteUserAvailability deletes all availability slots for a user
func (r *AvailabilityRepository) DeleteUserAvailability(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.Availability{}).Error
}

// DeleteUserAvailabilityForDay deletes a user's availability for a specific day
func (r *AvailabilityRepository) DeleteUserAvailabilityForDay(userID uint, dayOfWeek int) error {
	return r.db.Where("user_id = ? AND day_of_week = ?", userID, dayOfWeek).
		Delete(&models.Availability{}).Error
}

// SetUserAvailability replaces all availability for a user
// This is a batch operation - deletes old and creates new
func (r *AvailabilityRepository) SetUserAvailability(userID uint, availabilities []models.Availability) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete existing availability
		if err := tx.Where("user_id = ?", userID).Delete(&models.Availability{}).Error; err != nil {
			return err
		}

		// Create new availability slots
		for i := range availabilities {
			availabilities[i].UserID = userID
			availabilities[i].IsActive = true
			if err := tx.Create(&availabilities[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// GetAvailableUsersForDay gets users who are available on a specific day
func (r *AvailabilityRepository) GetAvailableUsersForDay(dayOfWeek int) ([]uint, error) {
	var userIDs []uint
	err := r.db.Model(&models.Availability{}).
		Select("DISTINCT user_id").
		Where("day_of_week = ? AND is_active = ?", dayOfWeek, true).
		Pluck("user_id", &userIDs).Error
	return userIDs, err
}

// IsUserAvailable checks if a user is available at a specific day and time
func (r *AvailabilityRepository) IsUserAvailable(userID uint, dayOfWeek int, timeStr string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Availability{}).
		Where("user_id = ? AND day_of_week = ? AND is_active = ? AND start_time <= ? AND end_time >= ?",
			userID, dayOfWeek, true, timeStr, timeStr).
		Count(&count).Error
	return count > 0, err
}
