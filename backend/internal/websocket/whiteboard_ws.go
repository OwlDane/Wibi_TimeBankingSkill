package websocket

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/timebankingskill/backend/internal/models"
)

// WhiteboardMessage represents a drawing event message
type WhiteboardMessage struct {
	Type      string      `json:"type"`      // "draw", "erase", "clear", "cursor", "user_join", "user_leave"
	SessionID uint        `json:"session_id"`
	UserID    uint        `json:"user_id"`
	UserName  string      `json:"user_name"`
	Stroke    interface{} `json:"stroke,omitempty"`
	Cursor    *CursorPos  `json:"cursor,omitempty"`
	Timestamp int64       `json:"timestamp"`
}

// CursorPos represents cursor position
type CursorPos struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// WhiteboardClient represents a connected whiteboard client
type WhiteboardClient struct {
	SessionID uint
	UserID    uint
	UserName  string
	Conn      *websocket.Conn
	Send      chan *WhiteboardMessage
}

// WhiteboardHub manages whiteboard connections for a session
type WhiteboardHub struct {
	SessionID   uint
	Clients     map[*WhiteboardClient]bool
	Broadcast   chan *WhiteboardMessage
	Register    chan *WhiteboardClient
	Unregister  chan *WhiteboardClient
	mu          sync.RWMutex
}

// Global map of whiteboard hubs per session
var whiteboardHubs = make(map[uint]*WhiteboardHub)
var hubsMutex = sync.RWMutex{}

// GetOrCreateWhiteboardHub gets or creates a whiteboard hub for a session
func GetOrCreateWhiteboardHub(sessionID uint) *WhiteboardHub {
	hubsMutex.Lock()
	defer hubsMutex.Unlock()

	if hub, exists := whiteboardHubs[sessionID]; exists {
		return hub
	}

	hub := &WhiteboardHub{
		SessionID:  sessionID,
		Clients:    make(map[*WhiteboardClient]bool),
		Broadcast:  make(chan *WhiteboardMessage, 256),
		Register:   make(chan *WhiteboardClient),
		Unregister: make(chan *WhiteboardClient),
	}

	whiteboardHubs[sessionID] = hub
	go hub.run()

	return hub
}

// run manages the hub's message routing
func (h *WhiteboardHub) run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.Clients[client] = true
			h.mu.Unlock()

			// Notify other users that someone joined
			joinMsg := &WhiteboardMessage{
				Type:      "user_join",
				SessionID: h.SessionID,
				UserID:    client.UserID,
				UserName:  client.UserName,
				Timestamp: getCurrentTimestamp(),
			}
			h.broadcastToOthers(client, joinMsg)

			log.Printf("User %s joined whiteboard session %d", client.UserName, h.SessionID)

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
			h.mu.Unlock()

			// Notify other users that someone left
			leaveMsg := &WhiteboardMessage{
				Type:      "user_leave",
				SessionID: h.SessionID,
				UserID:    client.UserID,
				UserName:  client.UserName,
				Timestamp: getCurrentTimestamp(),
			}
			h.broadcastToOthers(client, leaveMsg)

			log.Printf("User %s left whiteboard session %d", client.UserName, h.SessionID)

			// Clean up hub if no clients
			if len(h.Clients) == 0 {
				hubsMutex.Lock()
				delete(whiteboardHubs, h.SessionID)
				hubsMutex.Unlock()
			}

		case message := <-h.Broadcast:
			h.mu.RLock()
			for client := range h.Clients {
				select {
				case client.Send <- message:
				default:
					// Client's send channel is full, skip
					log.Printf("Client send channel full for user %d", client.UserID)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// broadcastToOthers broadcasts message to all clients except sender
func (h *WhiteboardHub) broadcastToOthers(sender *WhiteboardClient, message *WhiteboardMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.Clients {
		if client != sender {
			select {
			case client.Send <- message:
			default:
				log.Printf("Client send channel full for user %d", client.UserID)
			}
		}
	}
}

// HandleWhiteboardConnection handles a new whiteboard WebSocket connection
func HandleWhiteboardConnection(conn *websocket.Conn, sessionID uint, user *models.User) {
	hub := GetOrCreateWhiteboardHub(sessionID)

	client := &WhiteboardClient{
		SessionID: sessionID,
		UserID:    user.ID,
		UserName:  user.FullName,
		Conn:      conn,
		Send:      make(chan *WhiteboardMessage, 256),
	}

	hub.Register <- client

	// Start reading and writing goroutines
	go client.readPump(hub)
	go client.writePump()
}

// readPump reads messages from the WebSocket connection
func (c *WhiteboardClient) readPump(hub *WhiteboardHub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadDeadline(getDeadline())
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(getDeadline())
		return nil
	})

	for {
		var msg WhiteboardMessage
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			return
		}

		// Set message metadata
		msg.SessionID = c.SessionID
		msg.UserID = c.UserID
		msg.UserName = c.UserName
		msg.Timestamp = getCurrentTimestamp()

		// Broadcast to all clients in the hub
		hub.Broadcast <- &msg
	}
}

// writePump writes messages to the WebSocket connection
func (c *WhiteboardClient) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(getDeadline())
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteJSON(message); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(getDeadline())
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Helper functions
func getCurrentTimestamp() int64 {
	return time.Now().UnixMilli()
}

func getDeadline() time.Time {
	return time.Now().Add(60 * time.Second)
}
