package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/service"
	"github.com/timebankingskill/backend/internal/utils"
)

// TransactionHandler handles transaction-related HTTP requests
type TransactionHandler struct {
	transactionService *service.TransactionService
}

// NewTransactionHandler creates a new transaction handler
func NewTransactionHandler(transactionService *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{
		transactionService: transactionService,
	}
}

// GetUserTransactions retrieves transaction history for the authenticated user
// GET /api/v1/user/transactions?limit=10&offset=0
func (h *TransactionHandler) GetUserTransactions(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	// Get pagination parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get transactions
	transactions, total, err := h.transactionService.GetUserTransactionHistory(userID.(uint), limit, offset)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "Failed to fetch transactions", err)
		return
	}

	// Return response
	response := gin.H{
		"transactions": transactions,
		"total":        total,
		"limit":        limit,
		"offset":       offset,
	}

	utils.SendSuccess(c, http.StatusOK, "Transactions retrieved successfully", response)
}

// GetTransactionByID retrieves a specific transaction by ID
// GET /api/v1/user/transactions/:id
func (h *TransactionHandler) GetTransactionByID(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.SendError(c, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	// Get transaction ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.SendError(c, http.StatusBadRequest, "Invalid transaction ID", err)
		return
	}

	// Get transaction
	transaction, err := h.transactionService.GetTransaction(uint(id))
	if err != nil {
		utils.SendError(c, http.StatusNotFound, "Transaction not found", err)
		return
	}

	// Verify transaction belongs to user
	if transaction.UserID != userID.(uint) {
		utils.SendError(c, http.StatusForbidden, "Access denied", nil)
		return
	}

	utils.SendSuccess(c, http.StatusOK, "Transaction retrieved successfully", transaction)
}
