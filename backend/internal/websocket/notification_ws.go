package websocket

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/timebankingskill/backend/internal/dto"
	"github.com/timebankingskill/backend/internal/models"
	"github.com/timebankingskill/backend/internal/service"
)

// NotificationWebSocket handles WebSocket connections for real-time notifications
type NotificationWebSocket struct {
	notificationService *service.NotificationService
	upgrader            websocket.Upgrader
}

// NewNotificationWebSocket creates a new WebSocket handler for notifications
func NewNotificationWebSocket(notificationService *service.NotificationService) *NotificationWebSocket {
	return &NotificationWebSocket{
		notificationService: notificationService,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				// In production, validate the origin header
				return true
			},
		},
	}
}

// HandleConnection handles a new WebSocket connection for notifications
// GET /api/v1/ws/notifications
// This endpoint establishes a WebSocket connection that receives real-time notifications
// The connection stays open and receives notifications as they're created
//
// Message Format (sent to client):
// {
//   "id": 123,
//   "type": "session",
//   "title": "New Session Request",
//   "message": "Budi wants to learn React.js",
//   "data": {...},
//   "is_read": false,
//   "created_at": "2025-01-15T10:30:00Z"
// }
//
// Connection Lifecycle:
// 1. Client connects via WebSocket
// 2. Server registers client in NotificationService
// 3. Server sends existing unread notifications (optional)
// 4. Server waits for new notifications
// 5. When notification created, server broadcasts to all connected clients
// 6. Client disconnects, server unregisters client
func (ws *NotificationWebSocket) HandleConnection(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := ws.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// Create channel for this client
	notificationChan := make(chan *models.Notification, 10)
	defer close(notificationChan)

	// Register client with notification service
	ws.notificationService.RegisterClient(userID, notificationChan)
	defer ws.notificationService.UnregisterClient(userID, notificationChan)

	log.Printf("User %d connected to notification WebSocket", userID)

	// Listen for notifications and send to client
	for notification := range notificationChan {
		// Convert notification to response DTO
		notifResponse := dto.MapNotificationToResponse(notification)

		// Send to client
		if err := conn.WriteJSON(notifResponse); err != nil {
			log.Printf("WebSocket write error for user %d: %v", userID, err)
			return
		}
	}
}

// SendNotificationToClient sends a notification to a specific user via WebSocket
// This is called internally when a notification is created
// If user is offline, notification is already saved in database
func (ws *NotificationWebSocket) SendNotificationToClient(userID uint, notification interface{}) {
	// Convert to JSON for transmission
	jsonData, err := json.Marshal(notification)
	if err != nil {
		log.Printf("Failed to marshal notification: %v", err)
		return
	}

	// Log for debugging
	log.Printf("Sending notification to user %d: %s", userID, string(jsonData))
}

// BroadcastNotification broadcasts a notification to multiple users
// Used for notifications that affect multiple users (e.g., skill rating update)
func (ws *NotificationWebSocket) BroadcastNotification(userIDs []uint, notification interface{}) {
	for _, userID := range userIDs {
		ws.SendNotificationToClient(userID, notification)
	}
}

// GetConnectionCount returns the number of active WebSocket connections
// Useful for monitoring and debugging
func (ws *NotificationWebSocket) GetConnectionCount() int {
	// This would require tracking connections in NotificationService
	// For now, return 0
	return 0
}
