package dto

// UserAnalyticsResponse represents user analytics data
type UserAnalyticsResponse struct {
	UserID              uint                    `json:"user_id"`
	Username            string                  `json:"username"`
	TotalSessions       int                     `json:"total_sessions"`
	CompletedSessions   int                     `json:"completed_sessions"`
	TotalCreditsEarned  float64                 `json:"total_credits_earned"`
	TotalCreditsSpent   float64                 `json:"total_credits_spent"`
	CurrentBalance      float64                 `json:"current_balance"`
	AverageRating       float64                 `json:"average_rating"`
	TotalReviews        int                     `json:"total_reviews"`
	TotalBadges         int                     `json:"total_badges"`
	TotalHoursTaught    float64                 `json:"total_hours_taught"`
	TotalHoursLearned   float64                 `json:"total_hours_learned"`
	SkillsTeaching      int                     `json:"skills_teaching"`
	SkillsLearning      int                     `json:"skills_learning"`
	JoinedAt            int64                   `json:"joined_at"`
	LastActivityAt      int64                   `json:"last_activity_at"`
}

// PlatformAnalyticsResponse represents platform-wide analytics
type PlatformAnalyticsResponse struct {
	TotalUsers          int                     `json:"total_users"`
	ActiveUsers         int                     `json:"active_users"`
	TotalSessions       int                     `json:"total_sessions"`
	CompletedSessions   int                     `json:"completed_sessions"`
	TotalCreditsInFlow  float64                 `json:"total_credits_in_flow"`
	AverageSessionRating float64                `json:"average_session_rating"`
	TotalSkills         int                     `json:"total_skills"`
	TopSkills           []SkillStatistic        `json:"top_skills"`
	UserGrowth          []DateStatistic         `json:"user_growth"`
	SessionTrend        []DateStatistic         `json:"session_trend"`
	CreditFlow          []DateStatistic         `json:"credit_flow"`
}

// SkillStatistic represents skill statistics
type SkillStatistic struct {
	SkillID      uint    `json:"skill_id"`
	SkillName    string  `json:"skill_name"`
	TeacherCount int     `json:"teacher_count"`
	LearnerCount int     `json:"learner_count"`
	SessionCount int     `json:"session_count"`
	AverageRating float64 `json:"average_rating"`
}

// DateStatistic represents data point with date
type DateStatistic struct {
	Date  string      `json:"date"`
	Value interface{} `json:"value"`
}

// SessionStatistic represents session statistics
type SessionStatistic struct {
	TotalSessions       int     `json:"total_sessions"`
	CompletedSessions   int     `json:"completed_sessions"`
	CancelledSessions   int     `json:"cancelled_sessions"`
	PendingSessions     int     `json:"pending_sessions"`
	AverageDuration     float64 `json:"average_duration"`
	AverageRating       float64 `json:"average_rating"`
	OnlineSessions      int     `json:"online_sessions"`
	OfflineSessions     int     `json:"offline_sessions"`
}

// CreditStatistic represents credit flow statistics
type CreditStatistic struct {
	TotalEarned         float64 `json:"total_earned"`
	TotalSpent          float64 `json:"total_spent"`
	TotalHeld           float64 `json:"total_held"`
	AverageEarned       float64 `json:"average_earned"`
	AverageSpent        float64 `json:"average_spent"`
	TransactionCount    int     `json:"transaction_count"`
}

// UserGrowthResponse represents user growth data
type UserGrowthResponse struct {
	TotalUsers         int                `json:"total_users"`
	NewUsersThisMonth  int                `json:"new_users_this_month"`
	NewUsersThisWeek   int                `json:"new_users_this_week"`
	ActiveUsersMonth   int                `json:"active_users_month"`
	GrowthRate         float64            `json:"growth_rate"`
	GrowthTrend        []DateStatistic    `json:"growth_trend"`
}

// ExportAnalyticsRequest represents export request
type ExportAnalyticsRequest struct {
	Format    string `json:"format" binding:"required"` // "csv" or "pdf"
	StartDate int64  `json:"start_date"`
	EndDate   int64  `json:"end_date"`
	Type      string `json:"type"` // "user" or "platform"
}
