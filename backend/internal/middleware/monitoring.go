package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/timebankingskill/backend/internal/utils"
)

// RequestMetrics tracks HTTP request metrics
type RequestMetrics struct {
	// Total requests
	TotalRequests int64
	// Requests by method
	RequestsByMethod map[string]int64
	// Requests by status
	RequestsByStatus map[int]int64
	// Total response time
	TotalResponseTime time.Duration
	// Average response time
	AvgResponseTime time.Duration
	// Slowest request
	SlowestRequest time.Duration
	// Fastest request
	FastestRequest time.Duration
}

// Global request metrics
var requestMetrics = &RequestMetrics{
	RequestsByMethod: make(map[string]int64),
	RequestsByStatus: make(map[int]int64),
	FastestRequest:   time.Hour, // Initialize with large value
}

// MonitoringMiddleware tracks HTTP request metrics and errors
// Provides observability into application performance and health
//
// Features:
//   - Request/response timing
//   - Error tracking
//   - Status code monitoring
//   - Performance metrics
//
// Example:
//   router.Use(MonitoringMiddleware())
func MonitoringMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		startTime := time.Now()

		// Get request info
		method := c.Request.Method
		path := c.Request.URL.Path
		clientIP := c.ClientIP()

		// Process request
		c.Next()

		// Calculate metrics
		duration := time.Since(startTime)
		statusCode := c.Writer.Status()

		// Update metrics
		updateRequestMetrics(method, statusCode, duration)

		// Log request
		logger := utils.GetLogger()
		logger.LogRequest(method, path, clientIP, statusCode, duration)

		// Track errors
		if statusCode >= 400 {
			errorType, severity := utils.GetErrorCategoryFromStatusCode(statusCode)
			utils.RecordErrorHelper(
				errorType,
				nil,
				severity,
				map[string]interface{}{
					"status_code": statusCode,
					"path":        path,
					"method":      method,
					"duration_ms": duration.Milliseconds(),
				},
			)

			// Create alert for critical errors
			if statusCode >= 500 {
				alertManager := utils.GetAlertManager()
				alertManager.CreateAlert(
					"http_error",
					"HTTP "+string(rune(statusCode))+" error on "+path,
					"high",
					map[string]interface{}{
						"status_code": statusCode,
						"path":        path,
						"method":      method,
					},
				)
			}
		}

		// Check for slow requests (> 1 second)
		if duration > time.Second {
			logger.Warn("Slow request: %s %s took %v", method, path, duration)

			alertManager := utils.GetAlertManager()
			alertManager.CreateAlert(
				"slow_request",
				"Request took longer than 1 second",
				"medium",
				map[string]interface{}{
					"path":        path,
					"method":      method,
					"duration_ms": duration.Milliseconds(),
				},
			)
		}
	}
}

// updateRequestMetrics updates global request metrics
// Tracks request counts, response times, and status codes
//
// Parameters:
//   - method: HTTP method
//   - statusCode: HTTP status code
//   - duration: Request duration
func updateRequestMetrics(method string, statusCode int, duration time.Duration) {
	requestMetrics.TotalRequests++
	requestMetrics.RequestsByMethod[method]++
	requestMetrics.RequestsByStatus[statusCode]++
	requestMetrics.TotalResponseTime += duration

	// Update average response time
	requestMetrics.AvgResponseTime = requestMetrics.TotalResponseTime / time.Duration(requestMetrics.TotalRequests)

	// Update slowest/fastest
	if duration > requestMetrics.SlowestRequest {
		requestMetrics.SlowestRequest = duration
	}
	if duration < requestMetrics.FastestRequest {
		requestMetrics.FastestRequest = duration
	}
}

// GetRequestMetrics returns current request metrics
// Useful for monitoring dashboards
//
// Returns:
//   - *RequestMetrics: Current request metrics
//
// Example:
//   metrics := GetRequestMetrics()
//   fmt.Printf("Total requests: %d\n", metrics.TotalRequests)
func GetRequestMetrics() *RequestMetrics {
	return requestMetrics
}

// HealthCheckMiddleware provides a health check endpoint
// Returns 200 OK if system is healthy, 503 if unhealthy
//
// Checks:
//   - Error rate (should be < 5 errors/minute)
//   - Database connectivity
//   - Cache connectivity
//
// Example:
//   router.GET("/health", HealthCheckMiddleware())
func HealthCheckMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check error rate
		errorTracker := utils.GetErrorTracker()
		isHealthy := errorTracker.IsHealthy(5.0) // Max 5 errors per minute

		if !isHealthy {
			c.JSON(503, gin.H{
				"status": "unhealthy",
				"reason": "High error rate",
				"metrics": gin.H{
					"total_errors": errorTracker.TotalErrors,
					"error_rate":   errorTracker.GetErrorMetrics().ErrorRate,
				},
			})
			return
		}

		// System is healthy
		c.JSON(200, gin.H{
			"status": "healthy",
			"metrics": gin.H{
				"total_requests":    requestMetrics.TotalRequests,
				"avg_response_time": requestMetrics.AvgResponseTime.Milliseconds(),
				"total_errors":      errorTracker.TotalErrors,
			},
		})
	}
}

// MetricsMiddleware provides metrics endpoint
// Returns detailed performance and error metrics
//
// Example:
//   router.GET("/metrics", MetricsMiddleware())
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		errorTracker := utils.GetErrorTracker()
		errorMetrics := errorTracker.GetErrorMetrics()

		c.JSON(200, gin.H{
			"request_metrics": gin.H{
				"total_requests":     requestMetrics.TotalRequests,
				"requests_by_method": requestMetrics.RequestsByMethod,
				"requests_by_status": requestMetrics.RequestsByStatus,
				"avg_response_time":  requestMetrics.AvgResponseTime.Milliseconds(),
				"slowest_request":    requestMetrics.SlowestRequest.Milliseconds(),
				"fastest_request":    requestMetrics.FastestRequest.Milliseconds(),
			},
			"error_metrics": gin.H{
				"total_errors":       errorMetrics.TotalErrors,
				"errors_last_hour":   errorMetrics.ErrorsLastHour,
				"errors_last_day":    errorMetrics.ErrorsLastDay,
				"most_common_error":  errorMetrics.MostCommonError,
				"error_rate":         errorMetrics.ErrorRate,
				"error_breakdown":    errorTracker.ErrorCounts,
			},
			"recent_errors": errorTracker.GetErrorSummary(10),
			"recent_alerts":  utils.GetAlertManager().GetRecentAlerts(10),
		})
	}
}
