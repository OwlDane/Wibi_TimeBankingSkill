package utils

import (
	"runtime"
	"time"
)

// ErrorTracker tracks and monitors application errors
// Provides error categorization, stack traces, and metrics
type ErrorTracker struct {
	// Error count by type
	ErrorCounts map[string]int64
	// Total errors
	TotalErrors int64
	// Last error time
	LastErrorTime time.Time
	// Error history (last 100 errors)
	ErrorHistory []ErrorRecord
}

// ErrorRecord represents a single error event
type ErrorRecord struct {
	// Error message
	Message string
	// Error type/category
	Type string
	// Stack trace
	StackTrace string
	// Timestamp
	Timestamp time.Time
	// Severity level (low, medium, high, critical)
	Severity string
	// Context information
	Context map[string]interface{}
}

// ErrorMetrics provides error statistics
type ErrorMetrics struct {
	// Total errors
	TotalErrors int64
	// Errors in last hour
	ErrorsLastHour int64
	// Errors in last day
	ErrorsLastDay int64
	// Most common error type
	MostCommonError string
	// Error rate (errors per minute)
	ErrorRate float64
	// Average error recovery time
	AvgRecoveryTime time.Duration
}

// Global error tracker instance
var globalErrorTracker = &ErrorTracker{
	ErrorCounts:  make(map[string]int64),
	ErrorHistory: make([]ErrorRecord, 0, 100),
}

// GetErrorTracker returns the global error tracker instance
func GetErrorTracker() *ErrorTracker {
	return globalErrorTracker
}

// RecordError records an error with context
// Tracks error type, stack trace, and context information
//
// Parameters:
//   - errorType: Category of error (database, validation, auth, etc)
//   - err: The error that occurred
//   - severity: Error severity (low, medium, high, critical)
//   - context: Additional context information
//
// Example:
//   RecordError("database", err, "high", map[string]interface{}{
//     "query": "SELECT * FROM users",
//     "userID": 123,
//   })
func (et *ErrorTracker) RecordError(errorType string, err error, severity string, context map[string]interface{}) {
	if err == nil {
		return
	}

	// Increment error count
	et.ErrorCounts[errorType]++
	et.TotalErrors++
	et.LastErrorTime = time.Now()

	// Get stack trace
	stackTrace := getStackTrace()

	// Create error record
	record := ErrorRecord{
		Message:    err.Error(),
		Type:       errorType,
		StackTrace: stackTrace,
		Timestamp:  time.Now(),
		Severity:   severity,
		Context:    context,
	}

	// Add to history (keep last 100 errors)
	et.ErrorHistory = append(et.ErrorHistory, record)
	if len(et.ErrorHistory) > 100 {
		et.ErrorHistory = et.ErrorHistory[1:]
	}

	// Log error
	logger := GetLogger()
	logger.Error("Error recorded: %s [%s] - %v", errorType, severity, err)
}

// getStackTrace returns the current stack trace
// Useful for debugging and error tracking
//
// Returns:
//   - string: Formatted stack trace
func getStackTrace() string {
	buf := make([]byte, 4096)
	n := runtime.Stack(buf, false)
	return string(buf[:n])
}

// GetErrorMetrics returns current error metrics
// Provides statistics about error patterns
//
// Returns:
//   - *ErrorMetrics: Current error statistics
//
// Example:
//   metrics := GetErrorTracker().GetErrorMetrics()
//   fmt.Printf("Total errors: %d\n", metrics.TotalErrors)
func (et *ErrorTracker) GetErrorMetrics() *ErrorMetrics {
	now := time.Now()
	hourAgo := now.Add(-time.Hour)
	dayAgo := now.Add(-24 * time.Hour)

	// Count errors in time windows
	errorsLastHour := int64(0)
	errorsLastDay := int64(0)

	for _, record := range et.ErrorHistory {
		if record.Timestamp.After(hourAgo) {
			errorsLastHour++
		}
		if record.Timestamp.After(dayAgo) {
			errorsLastDay++
		}
	}

	// Find most common error type
	mostCommon := ""
	maxCount := int64(0)
	for errorType, count := range et.ErrorCounts {
		if count > maxCount {
			maxCount = count
			mostCommon = errorType
		}
	}

	// Calculate error rate (errors per minute)
	errorRate := 0.0
	if len(et.ErrorHistory) > 0 {
		firstError := et.ErrorHistory[0].Timestamp
		lastError := et.ErrorHistory[len(et.ErrorHistory)-1].Timestamp
		duration := lastError.Sub(firstError).Minutes()
		if duration > 0 {
			errorRate = float64(len(et.ErrorHistory)) / duration
		}
	}

	return &ErrorMetrics{
		TotalErrors:     et.TotalErrors,
		ErrorsLastHour:  errorsLastHour,
		ErrorsLastDay:   errorsLastDay,
		MostCommonError: mostCommon,
		ErrorRate:       errorRate,
	}
}

// ClearErrorHistory clears the error history
// Use for testing or when resetting monitoring
func (et *ErrorTracker) ClearErrorHistory() {
	et.ErrorHistory = make([]ErrorRecord, 0, 100)
	et.ErrorCounts = make(map[string]int64)
	et.TotalErrors = 0
}

// GetErrorSummary returns a summary of recent errors
// Useful for dashboards and monitoring
//
// Parameters:
//   - limit: Maximum number of errors to return
//
// Returns:
//   - []ErrorRecord: Recent error records
//
// Example:
//   errors := GetErrorTracker().GetErrorSummary(10)
//   // Returns last 10 errors
func (et *ErrorTracker) GetErrorSummary(limit int) []ErrorRecord {
	if limit > len(et.ErrorHistory) {
		limit = len(et.ErrorHistory)
	}

	// Return last 'limit' errors
	start := len(et.ErrorHistory) - limit
	if start < 0 {
		start = 0
	}

	return et.ErrorHistory[start:]
}

// IsHealthy checks if system is healthy based on error metrics
// Returns false if error rate is too high
//
// Parameters:
//   - maxErrorsPerMinute: Maximum acceptable error rate
//
// Returns:
//   - bool: True if system is healthy
//
// Example:
//   if !GetErrorTracker().IsHealthy(5.0) {
//     // Alert: too many errors
//   }
func (et *ErrorTracker) IsHealthy(maxErrorsPerMinute float64) bool {
	metrics := et.GetErrorMetrics()
	return metrics.ErrorRate <= maxErrorsPerMinute
}

// RecordErrorHelper is a convenience function for recording errors
// Uses global error tracker
//
// Parameters:
//   - errorType: Category of error
//   - err: The error
//   - severity: Error severity
//   - context: Additional context
//
// Example:
//   RecordErrorHelper("auth", err, "high", nil)
func RecordErrorHelper(errorType string, err error, severity string, context map[string]interface{}) {
	if err == nil {
		return
	}
	GetErrorTracker().RecordError(errorType, err, severity, context)
}

// ErrorCategories defines common error categories
const (
	ErrorCategoryDatabase   = "database"
	ErrorCategoryValidation = "validation"
	ErrorCategoryAuth       = "authentication"
	ErrorCategoryAuthorization = "authorization"
	ErrorCategoryNotFound   = "not_found"
	ErrorCategoryConflict   = "conflict"
	ErrorCategoryInternal   = "internal"
	ErrorCategoryExternal   = "external"
	ErrorCategoryTimeout    = "timeout"
	ErrorCategoryRateLimit  = "rate_limit"
)

// ErrorSeverities defines error severity levels
const (
	SeverityLow      = "low"
	SeverityMedium   = "medium"
	SeverityHigh     = "high"
	SeverityCritical = "critical"
)

// GetErrorCategoryFromStatusCode returns error category based on HTTP status code
// Helps categorize errors automatically
//
// Parameters:
//   - statusCode: HTTP status code
//
// Returns:
//   - string: Error category
//   - string: Error severity
//
// Example:
//   category, severity := GetErrorCategoryFromStatusCode(500)
//   // Returns ("internal", "critical")
func GetErrorCategoryFromStatusCode(statusCode int) (string, string) {
	switch {
	case statusCode >= 400 && statusCode < 500:
		if statusCode == 401 {
			return ErrorCategoryAuth, SeverityHigh
		}
		if statusCode == 403 {
			return ErrorCategoryAuthorization, SeverityHigh
		}
		if statusCode == 404 {
			return ErrorCategoryNotFound, SeverityLow
		}
		if statusCode == 409 {
			return ErrorCategoryConflict, SeverityMedium
		}
		if statusCode == 429 {
			return ErrorCategoryRateLimit, SeverityMedium
		}
		return ErrorCategoryValidation, SeverityMedium
	case statusCode >= 500:
		return ErrorCategoryInternal, SeverityCritical
	default:
		return ErrorCategoryInternal, SeverityLow
	}
}

// MonitoringAlert represents a monitoring alert
type MonitoringAlert struct {
	// Alert type
	Type string
	// Alert message
	Message string
	// Alert severity
	Severity string
	// Timestamp
	Timestamp time.Time
	// Alert data
	Data map[string]interface{}
}

// AlertManager manages monitoring alerts
type AlertManager struct {
	// Active alerts
	Alerts []MonitoringAlert
	// Alert callbacks (for sending notifications)
	Callbacks []func(alert MonitoringAlert)
}

// Global alert manager instance
var globalAlertManager = &AlertManager{
	Alerts:    make([]MonitoringAlert, 0),
	Callbacks: make([]func(alert MonitoringAlert), 0),
}

// GetAlertManager returns the global alert manager instance
func GetAlertManager() *AlertManager {
	return globalAlertManager
}

// CreateAlert creates and triggers a monitoring alert
// Notifies all registered callbacks
//
// Parameters:
//   - alertType: Type of alert
//   - message: Alert message
//   - severity: Alert severity
//   - data: Additional alert data
//
// Example:
//   GetAlertManager().CreateAlert("high_error_rate", "Error rate exceeded threshold", "critical", map[string]interface{}{
//     "current_rate": 10.5,
//     "threshold": 5.0,
//   })
func (am *AlertManager) CreateAlert(alertType, message, severity string, data map[string]interface{}) {
	alert := MonitoringAlert{
		Type:      alertType,
		Message:   message,
		Severity:  severity,
		Timestamp: time.Now(),
		Data:      data,
	}

	// Add to alerts
	am.Alerts = append(am.Alerts, alert)

	// Trigger callbacks
	for _, callback := range am.Callbacks {
		go callback(alert)
	}

	// Log alert
	logger := GetLogger()
	logger.Warn("Alert: %s - %s [%s]", alertType, message, severity)
}

// RegisterAlertCallback registers a callback for alerts
// Callbacks are triggered when alerts are created
//
// Parameters:
//   - callback: Function to call when alert is created
//
// Example:
//   GetAlertManager().RegisterAlertCallback(func(alert MonitoringAlert) {
//     // Send email notification
//     sendEmail(alert.Message)
//   })
func (am *AlertManager) RegisterAlertCallback(callback func(alert MonitoringAlert)) {
	am.Callbacks = append(am.Callbacks, callback)
}

// GetRecentAlerts returns recent alerts
// Useful for dashboards
//
// Parameters:
//   - limit: Maximum number of alerts to return
//
// Returns:
//   - []MonitoringAlert: Recent alerts
func (am *AlertManager) GetRecentAlerts(limit int) []MonitoringAlert {
	if limit > len(am.Alerts) {
		limit = len(am.Alerts)
	}

	start := len(am.Alerts) - limit
	if start < 0 {
		start = 0
	}

	return am.Alerts[start:]
}
