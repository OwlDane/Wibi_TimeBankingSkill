package models

import (
	"gorm.io/gorm"
)

// AutoMigrate runs all model migrations
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Skill{},
		&UserSkill{},
		&LearningSkill{},
		&Session{},
		&Review{},
		&Badge{},
		&UserBadge{},
		&Transaction{},
		&Notification{},
		&ForumCategory{},
		&ForumThread{},
		&ForumReply{},
		&SuccessStory{},
		&StoryComment{},
		&Endorsement{},
		&VideoSession{},
		&SharedFile{},
		&Whiteboard{},
		&SkillProgress{},
		&Milestone{},
	)
}
