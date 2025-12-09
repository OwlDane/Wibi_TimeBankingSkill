package models

import (
	"fmt"
	"gorm.io/gorm"
)

// AutoMigrate runs all model migrations
// Only migrates tables that don't exist to avoid ALTER TABLE issues
func AutoMigrate(db *gorm.DB) error {
	models := []struct {
		name  string
		model interface{}
	}{
		{"User", &User{}},
		{"Skill", &Skill{}},
		{"UserSkill", &UserSkill{}},
		{"LearningSkill", &LearningSkill{}},
		{"Session", &Session{}},
		{"Review", &Review{}},
		{"Badge", &Badge{}},
		{"UserBadge", &UserBadge{}},
		{"Transaction", &Transaction{}},
		{"Notification", &Notification{}},
		{"ForumCategory", &ForumCategory{}},
		{"ForumThread", &ForumThread{}},
		{"ForumReply", &ForumReply{}},
		{"SuccessStory", &SuccessStory{}},
		{"StoryComment", &StoryComment{}},
		{"Endorsement", &Endorsement{}},
		{"VideoSession", &VideoSession{}},
		{"SharedFile", &SharedFile{}},
		{"Whiteboard", &Whiteboard{}},
		{"SkillProgress", &SkillProgress{}},
		{"Milestone", &Milestone{}},
	}

	for _, m := range models {
		// Check if table exists using model's TableName
		if db.Migrator().HasTable(m.model) {
			fmt.Printf("  ✓ %s table exists, skipping\n", m.name)
			continue
		}
		
		fmt.Printf("  Creating %s table...\n", m.name)
		if err := db.Migrator().CreateTable(m.model); err != nil {
			return fmt.Errorf("failed to create %s table: %w", m.name, err)
		}
	}

	return nil
}


