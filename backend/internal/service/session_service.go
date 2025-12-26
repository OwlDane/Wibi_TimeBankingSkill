package service

import (
	"errors"
	"time"

	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

type SessionService struct {
	sessionRepo        *repository.SessionRepository
	userRepo           *repository.UserRepository
	skillRepo          *repository.SkillRepository
	transactionRepo    *repository.TransactionRepository
	notificationService *NotificationService
}

func NewSessionService(
	sessionRepo *repository.SessionRepository,
	userRepo *repository.UserRepository,
	skillRepo *repository.SkillRepository,
	transactionRepo *repository.TransactionRepository,
	notificationService *NotificationService,
) *SessionService {
	return &SessionService{
		sessionRepo:         sessionRepo,
		userRepo:            userRepo,
		skillRepo:           skillRepo,
		transactionRepo:     transactionRepo,
		notificationService: notificationService,
	}
}

// BookSession creates a new session request from student to teacher
// This is the entry point for students to request learning sessions with tutors
//
// Flow:
//   1. Validates teacher skill exists and is available
//   2. Checks student has sufficient credit balance
//   3. Validates no duplicate active session exists
//   4. Creates session with "pending" status
//   5. Sends notification to teacher
//
// Credit Handling:
//   - Credits are NOT deducted at booking time
//   - Credits are held in escrow when teacher approves
//   - Credits are transferred when session completes
//
// Parameters:
//   - studentID: ID of student requesting the session
//   - req: Session request details (skill, duration, schedule, etc)
//
// Returns:
//   - *SessionResponse: Created session with all details
//   - error: If validation fails, insufficient credits, or database error
//
// Example:
//   session, err := sessionService.BookSession(studentID, &CreateSessionRequest{
//     UserSkillID: 123,
//     Duration: 1.5,
//     ScheduledAt: time.Now().Add(24 * time.Hour),
//   })
func (s *SessionService) BookSession(studentID uint, req *dto.CreateSessionRequest) (*dto.SessionResponse, error) {
	// Get the user skill to find the teacher
	userSkill, err := s.skillRepo.GetUserSkillByID(req.UserSkillID)
	if err != nil {
		return nil, errors.New("skill not found")
	}

	// Validate teacher is not the student
	if userSkill.UserID == studentID {
		return nil, errors.New("you cannot book a session with yourself")
	}

	// Check if skill is available
	if !userSkill.IsAvailable {
		return nil, errors.New("this skill is currently not available for booking")
	}

	// Check if there's already an active session
	exists, err := s.sessionRepo.ExistsActiveSession(userSkill.UserID, studentID, req.UserSkillID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("you already have an active session request for this skill")
	}

	// Get student to check credit balance
	student, err := s.userRepo.GetByID(studentID)
	if err != nil {
		return nil, errors.New("student not found")
	}

	// Calculate credit amount
	creditAmount := req.Duration * userSkill.HourlyRate
	if creditAmount == 0 {
		creditAmount = req.Duration // Default 1:1 ratio
	}

	// Check if student has enough credits
	if student.CreditBalance < creditAmount {
		return nil, errors.New("insufficient credit balance")
	}

	// Validate scheduled time is in the future
	if req.ScheduledAt.Before(time.Now()) {
		return nil, errors.New("scheduled time must be in the future")
	}

	// Create session
	session := &models.Session{
		TeacherID:    userSkill.UserID,
		StudentID:    studentID,
		UserSkillID:  req.UserSkillID,
		Title:        req.Title,
		Description:  req.Description,
		Duration:     req.Duration,
		Mode:         models.SessionMode(req.Mode),
		ScheduledAt:  &req.ScheduledAt,
		Location:     req.Location,
		MeetingLink:  req.MeetingLink,
		CreditAmount: creditAmount,
		Status:       models.StatusPending,
	}

	if err := s.sessionRepo.Create(session); err != nil {
		return nil, errors.New("failed to create session")
	}

	// Reload session with relationships
	session, err = s.sessionRepo.GetByID(session.ID)
	if err != nil {
		return nil, err
	}

	// Send notification to teacher about new session request
	studentUser, _ := s.userRepo.GetByID(studentID)
	skill, _ := s.skillRepo.GetByID(userSkill.SkillID)
	notificationData := map[string]interface{}{
		"sessionID":   session.ID,
		"studentName": studentUser.FullName,
		"skillName":   skill.Name,
	}
	_, _ = s.notificationService.CreateNotification(
		userSkill.UserID,
		models.NotificationTypeSession,
		"New Session Request",
		studentUser.FullName+" wants to learn "+skill.Name,
		notificationData,
	)

	return dto.MapSessionToResponse(session), nil
}

// ApproveSession allows teacher to approve a pending session
// This implements the credit escrow system:
// 1. Credits are held (deducted from available balance but not transferred)
// 2. Credits remain held until session is completed
// 3. If session is cancelled, credits are refunded to student
// 4. If session is completed, credits are transferred to teacher
//
// Validation Steps:
//   1. Verify session exists
//   2. Check authorization (teacher owns session)
//   3. Verify session is pending
//   4. Validate student still has sufficient credits
//
// Credit Hold Process:
//   1. Deduct credits from student's available balance
//   2. Create transaction record for audit trail
//   3. Mark session as approved with credits held
//   4. Allow teacher to update session details
//
// Parameters:
//   - teacherID: Teacher approving the session
//   - sessionID: Session to approve
//   - req: Approval request with optional scheduling details
//
// Returns:
//   - *SessionResponse: Updated session details
//   - error: If validation fails or database error
//
// Side Effects:
//   - Updates student credit balance
//   - Creates transaction record
//   - Updates session status
//
// Example:
//   session, err := sessionService.ApproveSession(teacherID, sessionID, approvalReq)
//   // Credits are now held in escrow
func (s *SessionService) ApproveSession(teacherID, sessionID uint, req *dto.ApproveSessionRequest) (*dto.SessionResponse, error) {
	// Fetch session from database
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Authorization check: verify teacher owns this session
	if session.TeacherID != teacherID {
		return nil, errors.New("you are not authorized to approve this session")
	}

	// Status check: only pending sessions can be approved
	if session.Status != models.StatusPending {
		return nil, errors.New("session is not pending approval")
	}

	// Fetch student to verify credit availability
	student, err := s.userRepo.GetByID(session.StudentID)
	if err != nil {
		return nil, errors.New("student not found")
	}

	// Credit validation: ensure student still has enough credits
	// (Credits may have been spent on other sessions since booking)
	if student.CreditBalance < session.CreditAmount {
		return nil, errors.New("student has insufficient credits")
	}

	// CREDIT HOLD PHASE: Deduct credits from student's available balance
	// These credits are now in escrow and cannot be used for other sessions
	student.CreditBalance -= session.CreditAmount
	if err := s.userRepo.Update(student); err != nil {
		return nil, errors.New("failed to hold credits")
	}

	// Record the hold transaction for audit trail
	// This tracks the credit movement for transparency
	holdTransaction := &models.Transaction{
		UserID:        session.StudentID,
		Type:          models.TransactionHold,
		Amount:        -session.CreditAmount,
		BalanceBefore: student.CreditBalance + session.CreditAmount, // Balance before hold
		BalanceAfter:  student.CreditBalance,                         // Balance after hold
		Description:   "Credit hold for session: " + session.Title,
		SessionID:     &session.ID,
	}
	_ = s.transactionRepo.Create(holdTransaction)

	// Update session status to approved and mark credits as held
	session.Status = models.StatusApproved
	session.CreditHeld = true

	// Allow teacher to provide additional details (optional)
	if req.ScheduledAt != nil {
		session.ScheduledAt = req.ScheduledAt
	}
	if req.MeetingLink != "" {
		session.MeetingLink = req.MeetingLink
	}
	if req.Location != "" {
		session.Location = req.Location
	}
	if req.Notes != "" {
		session.Notes = req.Notes
	}

	// Persist session changes
	if err := s.sessionRepo.Update(session); err != nil {
		return nil, errors.New("failed to approve session")
	}

	// Send notification to student about session approval
	teacher, _ := s.userRepo.GetByID(teacherID)
	skill, _ := s.skillRepo.GetByID(session.UserSkill.SkillID)
	notificationData := map[string]interface{}{
		"sessionID":   session.ID,
		"teacherName": teacher.FullName,
		"skillName":   skill.Name,
	}
	_, _ = s.notificationService.CreateNotification(
		session.StudentID,
		models.NotificationTypeSession,
		"Session Approved",
		teacher.FullName+" approved your "+skill.Name+" session",
		notificationData,
	)

	return dto.MapSessionToResponse(session), nil
}

// RejectSession allows teacher to reject a pending session request
// This is called when teacher cannot or doesn't want to accept a session
//
// Flow:
//   1. Validates teacher owns the session
//   2. Validates session is in pending status
//   3. Updates session status to "rejected"
//   4. Records cancellation reason
//   5. Sends notification to student
//
// Credit Handling:
//   - No credits are deducted (session was never approved)
//   - Student's credit balance remains unchanged
//
// Parameters:
//   - teacherID: ID of teacher rejecting the session
//   - sessionID: ID of session to reject
//   - req: Rejection request with reason
//
// Returns:
//   - *SessionResponse: Updated session with rejected status
//   - error: If authorization fails or session not in valid state
func (s *SessionService) RejectSession(teacherID, sessionID uint, req *dto.RejectSessionRequest) (*dto.SessionResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Verify teacher owns this session
	if session.TeacherID != teacherID {
		return nil, errors.New("you are not authorized to reject this session")
	}

	// Verify session is pending
	if session.Status != models.StatusPending {
		return nil, errors.New("session is not pending")
	}

	// Update session
	session.Status = models.StatusRejected
	session.CancellationReason = req.Reason
	session.CancelledBy = &teacherID

	if err := s.sessionRepo.Update(session); err != nil {
		return nil, errors.New("failed to reject session")
	}

	return dto.MapSessionToResponse(session), nil
}

// StartSession marks a session as in progress
// Can be called by either teacher or student to begin the session
//
// Flow:
//   1. Validates user is part of the session (teacher or student)
//   2. Validates session can be started (approved and scheduled)
//   3. Updates status to "in_progress"
//   4. Records actual start time
//
// Pre-conditions:
//   - Session must be in "approved" status
//   - Session must have a scheduled time
//   - Scheduled time should be near current time (not enforced, but recommended)
//
// Parameters:
//   - userID: ID of user starting the session (teacher or student)
//   - sessionID: ID of session to start
//
// Returns:
//   - *SessionResponse: Updated session with in_progress status
//   - error: If user not authorized or session cannot be started
func (s *SessionService) StartSession(userID, sessionID uint) (*dto.SessionResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Verify user is part of this session
	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("you are not part of this session")
	}

	// Verify session can be started
	if !session.CanBeStarted() {
		return nil, errors.New("session cannot be started")
	}

	// Update session
	now := time.Now()
	session.Status = models.StatusInProgress
	session.StartedAt = &now

	if err := s.sessionRepo.Update(session); err != nil {
		return nil, errors.New("failed to start session")
	}

	return dto.MapSessionToResponse(session), nil
}

// ConfirmCompletion allows a participant to confirm session completion
// Both teacher and student must confirm before credits are transferred
//
// Flow:
//   1. Validates user is part of the session
//   2. Validates session is in progress
//   3. Marks user's confirmation (teacher_confirmed or student_confirmed)
//   4. If both confirmed: completes session and transfers credits
//   5. If only one confirmed: waits for other party's confirmation
//
// Credit Transfer:
//   - Only happens when BOTH parties confirm
//   - Credits are released from escrow to teacher
//   - Student's held credits are permanently deducted
//   - Teacher receives credits in their balance
//
// Parameters:
//   - userID: ID of user confirming (teacher or student)
//   - sessionID: ID of session to confirm
//   - req: Completion request with optional notes
//
// Returns:
//   - *SessionResponse: Updated session (may be completed if both confirmed)
//   - error: If user not authorized or session not in valid state
func (s *SessionService) ConfirmCompletion(userID, sessionID uint, req *dto.CompleteSessionRequest) (*dto.SessionResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Verify user is part of this session
	isTeacher := session.TeacherID == userID
	isStudent := session.StudentID == userID
	if !isTeacher && !isStudent {
		return nil, errors.New("you are not part of this session")
	}

	// Verify session is in progress
	if session.Status != models.StatusInProgress {
		return nil, errors.New("session is not in progress")
	}

	// Update confirmation
	if isTeacher {
		session.TeacherConfirmed = true
	}
	if isStudent {
		session.StudentConfirmed = true
	}

	// Add notes if provided
	if req.Notes != "" {
		if session.Notes != "" {
			session.Notes += "\n\n"
		}
		session.Notes += req.Notes
	}

	// Check if both confirmed
	if session.IsBothConfirmed() {
		// Complete the session and transfer credits
		if err := s.completeSession(session); err != nil {
			return nil, err
		}
	} else {
		if err := s.sessionRepo.Update(session); err != nil {
			return nil, errors.New("failed to confirm completion")
		}
	}

	// Reload session
	session, _ = s.sessionRepo.GetByID(sessionID)
	return dto.MapSessionToResponse(session), nil
}

// completeSession finalizes the session and transfers credits
// This is called when both teacher and student confirm session completion
// CREDIT RELEASE PHASE: Transfers held credits from escrow to teacher
func (s *SessionService) completeSession(session *models.Session) error {
	// Mark session as completed with current timestamp
	now := time.Now()
	session.Status = models.StatusCompleted
	session.CompletedAt = &now
	session.CreditReleased = true

	// CREDIT TRANSFER: Release held credits to teacher
	// Fetch teacher from database
	teacher, err := s.userRepo.GetByID(session.TeacherID)
	if err != nil {
		return errors.New("teacher not found")
	}

	// Add held credits to teacher's balance
	teacher.CreditBalance += session.CreditAmount
	if err := s.userRepo.Update(teacher); err != nil {
		return errors.New("failed to transfer credits")
	}

	// Record the earned transaction for audit trail
	// This documents the credit transfer from student to teacher
	earnedTransaction := &models.Transaction{
		UserID:        session.TeacherID,
		Type:          models.TransactionEarned,
		Amount:        session.CreditAmount,
		BalanceBefore: teacher.CreditBalance - session.CreditAmount,
		BalanceAfter:  teacher.CreditBalance,
		Description:   "Earned from session: " + session.Title,
		SessionID:     &session.ID,
	}
	_ = s.transactionRepo.Create(earnedTransaction)

	// Update skill statistics
	// Increment session count for this teaching skill
	userSkill, _ := s.skillRepo.GetUserSkillByID(session.UserSkillID)
	if userSkill != nil {
		userSkill.TotalSessions++
		_ = s.skillRepo.UpdateUserSkill(userSkill)
	}

	// Persist all session changes to database
	return s.sessionRepo.Update(session)
}

// CancelSession allows either party to cancel a session
// Can cancel pending or approved sessions (not in-progress or completed)
//
// Flow:
//   1. Validates user is part of the session
//   2. Validates session can be cancelled (pending or approved only)
//   3. If credits were held: refunds credits to student
//   4. Updates session status to "cancelled"
//   5. Records cancellation reason and who cancelled
//
// Credit Refund:
//   - If session was approved (credits held): refunds to student
//   - If session was pending (no credits held): no refund needed
//   - Creates refund transaction for audit trail
//
// Parameters:
//   - userID: ID of user cancelling (teacher or student)
//   - sessionID: ID of session to cancel
//   - req: Cancellation request with reason
//
// Returns:
//   - *SessionResponse: Updated session with cancelled status
//   - error: If user not authorized or session cannot be cancelled
func (s *SessionService) CancelSession(userID, sessionID uint, req *dto.CancelSessionRequest) (*dto.SessionResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Verify user is part of this session
	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("you are not part of this session")
	}

	// Can only cancel pending or approved sessions
	if session.Status != models.StatusPending && session.Status != models.StatusApproved {
		return nil, errors.New("session cannot be cancelled")
	}

	// If credits were held, refund them
	if session.CreditHeld && !session.CreditReleased {
		student, err := s.userRepo.GetByID(session.StudentID)
		if err != nil {
			return nil, errors.New("student not found")
		}

		student.CreditBalance += session.CreditAmount
		if err := s.userRepo.Update(student); err != nil {
			return nil, errors.New("failed to refund credits")
		}

		// Create refund transaction
		refundTransaction := &models.Transaction{
			UserID:        session.StudentID,
			Type:          models.TransactionRefund,
			Amount:        session.CreditAmount,
			BalanceBefore: student.CreditBalance - session.CreditAmount,
			BalanceAfter:  student.CreditBalance,
			Description:   "Refund for cancelled session: " + session.Title,
			SessionID:     &session.ID,
		}
		_ = s.transactionRepo.Create(refundTransaction)
	}

	// Update session
	session.Status = models.StatusCancelled
	session.CancelledBy = &userID
	session.CancellationReason = req.Reason

	if err := s.sessionRepo.Update(session); err != nil {
		return nil, errors.New("failed to cancel session")
	}

	return dto.MapSessionToResponse(session), nil
}

// GetSession retrieves a session by ID
func (s *SessionService) GetSession(userID, sessionID uint) (*dto.SessionResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		return nil, errors.New("session not found")
	}

	// Verify user is part of this session
	if session.TeacherID != userID && session.StudentID != userID {
		return nil, errors.New("you are not authorized to view this session")
	}

	return dto.MapSessionToResponse(session), nil
}

// GetUserSessions retrieves all sessions for a user with filtering and pagination
// Supports filtering by role (teacher/student) and status (pending/completed/etc)
//
// Filtering:
//   - role: "teacher" (sessions as teacher), "student" (sessions as student), "" (all)
//   - status: Filter by session status (pending, approved, completed, etc)
//   - limit/offset: Pagination support
//
// Parameters:
//   - userID: ID of user to get sessions for
//   - role: Optional role filter ("teacher", "student", or empty for all)
//   - status: Optional status filter (session status string)
//   - limit: Maximum number of sessions to return
//   - offset: Number of sessions to skip (for pagination)
//
// Returns:
//   - *SessionListResponse: Paginated list of sessions with total count
//   - error: If database error occurs
func (s *SessionService) GetUserSessions(userID uint, role, status string, limit, offset int) (*dto.SessionListResponse, error) {
	var sessions []models.Session
	var total int64
	var err error

	switch role {
	case "teacher":
		sessions, total, err = s.sessionRepo.GetUserSessionsAsTeacher(userID, status, limit, offset)
	case "student":
		sessions, total, err = s.sessionRepo.GetUserSessionsAsStudent(userID, status, limit, offset)
	default:
		sessions, total, err = s.sessionRepo.GetAllUserSessions(userID, status, limit, offset)
	}

	if err != nil {
		return nil, err
	}

	return &dto.SessionListResponse{
		Sessions: dto.MapSessionsToResponse(sessions),
		Total:    total,
		Page:     offset/limit + 1,
		Limit:    limit,
	}, nil
}

// GetUpcomingSessions retrieves upcoming sessions for a user
func (s *SessionService) GetUpcomingSessions(userID uint, limit int) ([]dto.SessionResponse, error) {
	sessions, err := s.sessionRepo.GetUpcomingSessions(userID, limit)
	if err != nil {
		return nil, err
	}
	return dto.MapSessionsToResponse(sessions), nil
}

// GetPendingRequests retrieves pending session requests for a teacher
func (s *SessionService) GetPendingRequests(teacherID uint) ([]dto.SessionResponse, error) {
	sessions, err := s.sessionRepo.GetPendingSessionsForTeacher(teacherID)
	if err != nil {
		return nil, err
	}
	return dto.MapSessionsToResponse(sessions), nil
}
