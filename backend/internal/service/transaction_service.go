package service

import (
	"errors"
	"fmt"

	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/repository"
)

// TransactionService handles transaction business logic
type TransactionService struct {
	transactionRepo     *repository.TransactionRepository
	userRepo            *repository.UserRepository
	notificationService *NotificationService
}

// NewTransactionService creates a new transaction service
func NewTransactionService(
	transactionRepo *repository.TransactionRepository,
	userRepo *repository.UserRepository,
	notificationService *NotificationService,
) *TransactionService {
	return &TransactionService{
		transactionRepo:     transactionRepo,
		userRepo:            userRepo,
		notificationService: notificationService,
	}
}

// CreateTransaction creates a new transaction record and records balance history
// This function records the transaction history but does NOT update user balance
// Balance is updated separately through UpdateUserBalance
//
// Transaction Recording:
//   - Records balance before and after transaction
//   - Creates audit trail for all credit movements
//   - Supports optional session linking for context
//
// Balance Validation:
//   - Prevents negative balance for spend/hold transactions
//   - Allows negative balance for refunds (to correct errors)
//   - Validates sufficient credits before deduction
//
// Parameters:
//   - userID: User performing the transaction
//   - txType: Type of transaction (earned, spent, hold, refund, bonus, penalty)
//   - amount: Credit amount (positive for earnings, negative for spending)
//   - description: Human-readable description of transaction
//   - sessionID: Optional session ID for context
//
// Returns:
//   - *Transaction: Created transaction record
//   - error: If balance check fails or database error
//
// Example:
//   tx, err := transactionService.CreateTransaction(
//     userID, TransactionEarned, 10.0, "Earned from teaching", &sessionID,
//   )
func (s *TransactionService) CreateTransaction(
	userID uint,
	txType models.TransactionType,
	amount float64,
	description string,
	sessionID *uint,
) (*models.Transaction, error) {
	// Get current balance before transaction for audit trail
	balanceBefore, err := s.transactionRepo.GetUserBalance(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current balance: %w", err)
	}

	// Calculate balance after transaction
	balanceAfter := balanceBefore + amount

	// Prevent negative balance for non-refund transactions
	// Refunds are allowed to go negative to correct accounting errors
	if balanceAfter < 0 && txType != models.TransactionRefund {
		return nil, errors.New("insufficient credits")
	}

	// Create transaction record with balance snapshot
	transaction := &models.Transaction{
		UserID:        userID,
		Type:          txType,
		Amount:        amount,
		BalanceBefore: balanceBefore,
		BalanceAfter:  balanceAfter,
		Description:   description,
		SessionID:     sessionID,
	}

	if err := s.transactionRepo.Create(transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// HoldCredits holds credits for a pending session (escrow)
// Credits are deducted from available balance but not yet transferred
func (s *TransactionService) HoldCredits(
	userID uint,
	amount float64,
	sessionID uint,
) (*models.Transaction, error) {
	// Validate amount
	if amount <= 0 {
		return nil, errors.New("hold amount must be positive")
	}

	// Get current balance
	currentBalance, err := s.transactionRepo.GetUserBalance(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current balance: %w", err)
	}

	// Check if user has enough credits
	if currentBalance < amount {
		return nil, fmt.Errorf("insufficient credits: have %.1f, need %.1f", currentBalance, amount)
	}

	// Create hold transaction (negative amount to deduct from available)
	description := fmt.Sprintf("Credits held for session %d", sessionID)
	transaction, err := s.CreateTransaction(
		userID,
		models.TransactionHold,
		-amount,
		description,
		&sessionID,
	)

	if err != nil {
		return nil, err
	}

	return transaction, nil
}

// ReleaseCredits releases held credits back to user (when session is cancelled/declined)
func (s *TransactionService) ReleaseCredits(
	userID uint,
	amount float64,
	sessionID uint,
) (*models.Transaction, error) {
	// Validate amount
	if amount <= 0 {
		return nil, errors.New("release amount must be positive")
	}

	// Create refund transaction (positive amount to add back)
	description := fmt.Sprintf("Credits released from cancelled session %d", sessionID)
	transaction, err := s.CreateTransaction(
		userID,
		models.TransactionRefund,
		amount,
		description,
		&sessionID,
	)

	if err != nil {
		return nil, err
	}

	return transaction, nil
}

// TransferCredits transfers credits from student to teacher (when session completes)
// This creates two transactions: debit from student, credit to teacher
// Performance: O(1) - constant time operation (2 database writes)
// Atomicity: Both transactions must succeed or entire operation fails
//
// Transaction Flow:
//   1. Debit credits from student (negative amount)
//   2. Credit credits to teacher (positive amount)
//   3. Both transactions linked to same session for audit trail
//
// Error Handling:
//   - If student debit fails: operation stops (teacher not credited)
//   - If teacher credit fails: student already debited (must be handled manually)
//   - Should be wrapped in database transaction for true atomicity
//
// Parameters:
//   - studentID: User learning (paying credits)
//   - teacherID: User teaching (receiving credits)
//   - amount: Credit amount to transfer
//   - sessionID: Session ID for audit trail
//
// Returns:
//   - error: If either transaction fails
//
// Example:
//   err := transactionService.TransferCredits(studentID, teacherID, 10.0, sessionID)
//   // Transfers 10 credits from student to teacher
func (s *TransactionService) TransferCredits(
	studentID uint,
	teacherID uint,
	amount float64,
	sessionID uint,
) error {
	// Validate amount
	if amount <= 0 {
		return errors.New("transfer amount must be positive")
	}

	// Debit from student (negative amount)
	_, err := s.CreateTransaction(
		studentID,
		models.TransactionSpent,
		-amount,
		fmt.Sprintf("Spent on learning session %d", sessionID),
		&sessionID,
	)
	if err != nil {
		return fmt.Errorf("failed to debit student: %w", err)
	}

	// Credit to teacher (positive amount)
	_, err = s.CreateTransaction(
		teacherID,
		models.TransactionEarned,
		amount,
		fmt.Sprintf("Earned from teaching session %d", sessionID),
		&sessionID,
	)
	if err != nil {
		return fmt.Errorf("failed to credit teacher: %w", err)
	}

	// Send credit earned notification to teacher
	notificationData := map[string]interface{}{
		"amount":      amount,
		"sessionID":   sessionID,
		"description": fmt.Sprintf("Earned from teaching session %d", sessionID),
	}
	_, _ = s.notificationService.CreateNotification(
		teacherID,
		models.NotificationTypeCredit,
		"Credit Earned! 💰",
		fmt.Sprintf("You earned %.1f credits from a teaching session", amount),
		notificationData,
	)

	return nil
}

// AwardBonusCredits awards bonus credits to user
// Used for achievements, referrals, high ratings, etc
func (s *TransactionService) AwardBonusCredits(
	userID uint,
	amount float64,
	description string,
) (*models.Transaction, error) {
	// Validate amount
	if amount <= 0 {
		return nil, errors.New("bonus amount must be positive")
	}

	transaction, err := s.CreateTransaction(
		userID,
		models.TransactionBonus,
		amount,
		description,
		nil,
	)

	if err != nil {
		return nil, err
	}

	// Send bonus credit notification
	notificationData := map[string]interface{}{
		"amount":      amount,
		"description": description,
	}
	_, _ = s.notificationService.CreateNotification(
		userID,
		models.NotificationTypeCredit,
		"Bonus Credits Awarded! 🎉",
		fmt.Sprintf("You received %.1f bonus credits: %s", amount, description),
		notificationData,
	)

	return transaction, nil
}

// ApplyPenalty applies penalty credits to user
// Used for no-shows, cancellations, etc
func (s *TransactionService) ApplyPenalty(
	userID uint,
	amount float64,
	description string,
	sessionID *uint,
) (*models.Transaction, error) {
	// Validate amount
	if amount <= 0 {
		return nil, errors.New("penalty amount must be positive")
	}

	transaction, err := s.CreateTransaction(
		userID,
		models.TransactionPenalty,
		-amount,
		description,
		sessionID,
	)

	if err != nil {
		return nil, err
	}

	return transaction, nil
}

// GetUserBalance gets current credit balance for user
func (s *TransactionService) GetUserBalance(userID uint) (float64, error) {
	balance, err := s.transactionRepo.GetUserBalance(userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get user balance: %w", err)
	}
	return balance, nil
}

// GetUserTransactionHistory gets paginated transaction history for user
func (s *TransactionService) GetUserTransactionHistory(
	userID uint,
	limit int,
	offset int,
) ([]models.Transaction, int64, error) {
	// Validate pagination params
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	transactions, total, err := s.transactionRepo.GetUserTransactionHistory(userID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get transaction history: %w", err)
	}

	return transactions, total, nil
}

// GetTransaction gets a specific transaction by ID
func (s *TransactionService) GetTransaction(id uint) (*models.Transaction, error) {
	transaction, err := s.transactionRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction: %w", err)
	}
	return transaction, nil
}

// CalculateUserStats calculates comprehensive user statistics
func (s *TransactionService) CalculateUserStats(userID uint) (map[string]interface{}, error) {
	// Get all transactions for user
	transactions, _, err := s.transactionRepo.GetUserTransactionHistory(userID, 10000, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}

	stats := map[string]interface{}{
		"credit_balance":           0.0,
		"total_credits_earned":     0.0,
		"total_credits_spent":      0.0,
		"total_credits_bonus":      0.0,
		"total_credits_refunded":   0.0,
		"total_credits_penalized":  0.0,
	}

	// Calculate stats from transactions
	for _, tx := range transactions {
		switch tx.Type {
		case models.TransactionEarned:
			stats["total_credits_earned"] = stats["total_credits_earned"].(float64) + tx.Amount
		case models.TransactionSpent:
			stats["total_credits_spent"] = stats["total_credits_spent"].(float64) + (-tx.Amount)
		case models.TransactionBonus:
			stats["total_credits_bonus"] = stats["total_credits_bonus"].(float64) + tx.Amount
		case models.TransactionRefund:
			stats["total_credits_refunded"] = stats["total_credits_refunded"].(float64) + tx.Amount
		case models.TransactionPenalty:
			stats["total_credits_penalized"] = stats["total_credits_penalized"].(float64) + (-tx.Amount)
		}
	}

	// Get current balance
	balance, err := s.GetUserBalance(userID)
	if err != nil {
		return nil, err
	}
	stats["credit_balance"] = balance

	return stats, nil
}
