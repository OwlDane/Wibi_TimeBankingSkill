package middleware

import (
  "fmt"
  "net/http"
  "sync"
  "time"

  "github.com/gin-gonic/gin"
)

// RateLimiter implements token bucket algorithm for rate limiting
type RateLimiter struct {
  requests map[string]*ClientLimit
  mu       sync.RWMutex
  // Configuration
  requestsPerMinute int
  cleanupInterval   time.Duration
}

// ClientLimit tracks requests per client
type ClientLimit struct {
  tokens    float64
  lastReset time.Time
}

// NewRateLimiter creates a new rate limiter
// requestsPerMinute: max requests allowed per minute per client
func NewRateLimiter(requestsPerMinute int) *RateLimiter {
  rl := &RateLimiter{
    requests:          make(map[string]*ClientLimit),
    requestsPerMinute: requestsPerMinute,
    cleanupInterval:   5 * time.Minute,
  }

  // Start cleanup goroutine
  go rl.cleanup()

  return rl
}

// Allow checks if request is allowed for this client
func (rl *RateLimiter) Allow(clientID string) bool {
  rl.mu.Lock()
  defer rl.mu.Unlock()

  now := time.Now()
  limit, exists := rl.requests[clientID]

  if !exists {
    // New client - allow request and initialize
    rl.requests[clientID] = &ClientLimit{
      tokens:    float64(rl.requestsPerMinute - 1),
      lastReset: now,
    }
    return true
  }

  // Calculate elapsed time since last reset
  elapsed := now.Sub(limit.lastReset).Seconds()
  minutesPassed := elapsed / 60.0

  // Refill tokens based on time passed
  tokensToAdd := minutesPassed * float64(rl.requestsPerMinute) / 1.0
  limit.tokens = min(float64(rl.requestsPerMinute), limit.tokens+tokensToAdd)

  // Reset timer if a minute has passed
  if minutesPassed >= 1.0 {
    limit.lastReset = now
  }

  // Check if token available
  if limit.tokens >= 1.0 {
    limit.tokens--
    return true
  }

  return false
}

// cleanup removes old entries to prevent memory leak
func (rl *RateLimiter) cleanup() {
  ticker := time.NewTicker(rl.cleanupInterval)
  defer ticker.Stop()

  for range ticker.C {
    rl.mu.Lock()
    now := time.Now()

    // Remove entries older than 1 hour
    for clientID, limit := range rl.requests {
      if now.Sub(limit.lastReset) > time.Hour {
        delete(rl.requests, clientID)
      }
    }

    rl.mu.Unlock()
  }
}

// RateLimitMiddleware creates a rate limiting middleware
// Limits requests per minute per IP address
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
  limiter := NewRateLimiter(requestsPerMinute)

  return func(c *gin.Context) {
    // Get client IP
    clientIP := c.ClientIP()

    // Check rate limit
    if !limiter.Allow(clientIP) {
      c.JSON(http.StatusTooManyRequests, gin.H{
        "error":   "Rate limit exceeded",
        "message": fmt.Sprintf("Maximum %d requests per minute allowed", requestsPerMinute),
      })
      c.Abort()
      return
    }

    c.Next()
  }
}

// Helper function
func min(a, b float64) float64 {
  if a < b {
    return a
  }
  return b
}
