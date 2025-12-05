package utils

import (
  "fmt"
  "log"
  "os"
  "time"
)

// LogLevel defines the severity of log messages
type LogLevel int

const (
  DEBUG LogLevel = iota
  INFO
  WARN
  ERROR
  FATAL
)

// Logger provides structured logging with levels and timestamps
type Logger struct {
  level LogLevel
}

// NewLogger creates a new logger instance
func NewLogger(level LogLevel) *Logger {
  return &Logger{level: level}
}

// formatLog formats log message with timestamp and level
func (l *Logger) formatLog(level string, message string, args ...interface{}) string {
  timestamp := time.Now().Format("2006-01-02 15:04:05")
  formattedMsg := fmt.Sprintf(message, args...)
  return fmt.Sprintf("[%s] %s: %s", timestamp, level, formattedMsg)
}

// Debug logs debug level message
func (l *Logger) Debug(message string, args ...interface{}) {
  if l.level <= DEBUG {
    log.Println(l.formatLog("DEBUG", message, args...))
  }
}

// Info logs info level message
func (l *Logger) Info(message string, args ...interface{}) {
  if l.level <= INFO {
    log.Println(l.formatLog("INFO", message, args...))
  }
}

// Warn logs warning level message
func (l *Logger) Warn(message string, args ...interface{}) {
  if l.level <= WARN {
    log.Println(l.formatLog("WARN", message, args...))
  }
}

// Error logs error level message
func (l *Logger) Error(message string, args ...interface{}) {
  if l.level <= ERROR {
    log.Println(l.formatLog("ERROR", message, args...))
  }
}

// Fatal logs fatal level message and exits
func (l *Logger) Fatal(message string, args ...interface{}) {
  log.Println(l.formatLog("FATAL", message, args...))
  os.Exit(1)
}

// LogRequest logs HTTP request details
func (l *Logger) LogRequest(method, path, clientIP string, statusCode int, duration time.Duration) {
  l.Info("HTTP %s %s from %s - Status: %d - Duration: %v",
    method, path, clientIP, statusCode, duration)
}

// LogError logs error with context
func (l *Logger) LogError(operation string, err error) {
  l.Error("%s failed: %v", operation, err)
}

// LogDatabaseQuery logs database query execution
func (l *Logger) LogDatabaseQuery(query string, duration time.Duration) {
  l.Debug("Database query executed in %v: %s", duration, query)
}

// Global logger instance
var globalLogger = NewLogger(INFO)

// SetLogLevel sets the global logger level
func SetLogLevel(level LogLevel) {
  globalLogger.level = level
}

// GetLogger returns the global logger instance
func GetLogger() *Logger {
  return globalLogger
}
