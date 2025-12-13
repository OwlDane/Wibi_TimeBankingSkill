package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"time"
)

// Admin represents an administrator account
type Admin struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	Email     string          `gorm:"uniqueIndex;not null" json:"email"`
	Password  string          `gorm:"not null" json:"-"` // Never expose password
	FullName  string          `gorm:"not null" json:"full_name"`
	Role      string          `gorm:"default:'admin'" json:"role"` // 'admin', 'super_admin', 'moderator'
	Permissions datatypes.JSONType `gorm:"type:jsonb" json:"permissions"` // ['manage_users', 'manage_content', 'view_analytics']
	IsActive  bool            `gorm:"default:true" json:"is_active"`
	LastLogin *time.Time      `json:"last_login"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt gorm.DeletedAt  `gorm:"index" json:"deleted_at"`
}

// TableName specifies the table name for Admin model
func (Admin) TableName() string {
	return "admins"
}

// AdminPermissions represents available permissions
type AdminPermissions struct {
	ManageUsers      bool `json:"manage_users"`
	ManageContent    bool `json:"manage_content"`
	ViewAnalytics    bool `json:"view_analytics"`
	ManageSessions   bool `json:"manage_sessions"`
	ManageFinance    bool `json:"manage_finance"`
	ManageSettings   bool `json:"manage_settings"`
	ModerateContent  bool `json:"moderate_content"`
	ViewReports      bool `json:"view_reports"`
}

// Scan implements sql.Scanner interface
func (ap *AdminPermissions) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion failed")
	}
	return json.Unmarshal(bytes, &ap)
}

// Value implements driver.Valuer interface
func (ap AdminPermissions) Value() (driver.Value, error) {
	return json.Marshal(ap)
}

// GetPermissions returns parsed permissions
func (a *Admin) GetPermissions() AdminPermissions {
	var perms AdminPermissions
	if a.Permissions != nil {
		json.Unmarshal(a.Permissions, &perms)
	}
	return perms
}

// HasPermission checks if admin has specific permission
func (a *Admin) HasPermission(permission string) bool {
	perms := a.GetPermissions()
	switch permission {
	case "manage_users":
		return perms.ManageUsers
	case "manage_content":
		return perms.ManageContent
	case "view_analytics":
		return perms.ViewAnalytics
	case "manage_sessions":
		return perms.ManageSessions
	case "manage_finance":
		return perms.ManageFinance
	case "manage_settings":
		return perms.ManageSettings
	case "moderate_content":
		return perms.ModerateContent
	case "view_reports":
		return perms.ViewReports
	default:
		return false
	}
}
