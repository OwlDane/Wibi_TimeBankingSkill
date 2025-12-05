package utils

import (
  "encoding/json"
  "sync"
  "time"
)

// CacheEntry represents a single cache entry with expiration
type CacheEntry struct {
  Value     interface{}
  ExpiresAt time.Time
}

// Cache provides in-memory caching with TTL support
type Cache struct {
  data map[string]CacheEntry
  mu   sync.RWMutex
  // Configuration
  defaultTTL    time.Duration
  cleanupTicker *time.Ticker
}

// NewCache creates a new cache instance
// defaultTTL: default time-to-live for cache entries
func NewCache(defaultTTL time.Duration) *Cache {
  c := &Cache{
    data:       make(map[string]CacheEntry),
    defaultTTL: defaultTTL,
  }

  // Start cleanup goroutine
  go c.cleanup()

  return c
}

// Set stores a value in cache with default TTL
func (c *Cache) Set(key string, value interface{}) {
  c.SetWithTTL(key, value, c.defaultTTL)
}

// SetWithTTL stores a value in cache with custom TTL
func (c *Cache) SetWithTTL(key string, value interface{}, ttl time.Duration) {
  c.mu.Lock()
  defer c.mu.Unlock()

  c.data[key] = CacheEntry{
    Value:     value,
    ExpiresAt: time.Now().Add(ttl),
  }
}

// Get retrieves a value from cache
// Returns (value, found) tuple
func (c *Cache) Get(key string) (interface{}, bool) {
  c.mu.RLock()
  defer c.mu.RUnlock()

  entry, exists := c.data[key]
  if !exists {
    return nil, false
  }

  // Check if expired
  if time.Now().After(entry.ExpiresAt) {
    return nil, false
  }

  return entry.Value, true
}

// GetJSON retrieves and unmarshals JSON from cache
func (c *Cache) GetJSON(key string, v interface{}) bool {
  value, found := c.Get(key)
  if !found {
    return false
  }

  // Convert to JSON and unmarshal
  jsonBytes, err := json.Marshal(value)
  if err != nil {
    return false
  }

  err = json.Unmarshal(jsonBytes, v)
  return err == nil
}

// Delete removes a value from cache
func (c *Cache) Delete(key string) {
  c.mu.Lock()
  defer c.mu.Unlock()

  delete(c.data, key)
}

// Clear removes all entries from cache
func (c *Cache) Clear() {
  c.mu.Lock()
  defer c.mu.Unlock()

  c.data = make(map[string]CacheEntry)
}

// Size returns number of entries in cache
func (c *Cache) Size() int {
  c.mu.RLock()
  defer c.mu.RUnlock()

  return len(c.data)
}

// cleanup removes expired entries periodically
func (c *Cache) cleanup() {
  ticker := time.NewTicker(1 * time.Minute)
  defer ticker.Stop()

  for range ticker.C {
    c.mu.Lock()
    now := time.Now()

    // Remove expired entries
    for key, entry := range c.data {
      if now.After(entry.ExpiresAt) {
        delete(c.data, key)
      }
    }

    c.mu.Unlock()
  }
}

// Global cache instance
var globalCache = NewCache(5 * time.Minute)

// GetCache returns the global cache instance
func GetCache() *Cache {
  return globalCache
}

// CacheKey constants for common cache keys
const (
  CacheKeySkills           = "skills:all"
  CacheKeyBadges           = "badges:all"
  CacheKeyLeaderboardBadge = "leaderboard:badges"
  CacheKeyLeaderboardRarity = "leaderboard:rarity"
  CacheKeyLeaderboardSession = "leaderboard:sessions"
  CacheKeyLeaderboardRating = "leaderboard:rating"
  CacheKeyLeaderboardCredit = "leaderboard:credits"
)
