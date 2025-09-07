// Connection status types
export type ConnectionStatus = "disconnected" | "connecting" | "connected";

// Message types
export type MessageType = "chat" | "info" | "error" | "system";

// Base message interface
export interface ChatMessage {
  id: string;
  type: MessageType;
  message: string;
  personName: string;
  personId: string;
  timestamp: number;
  roomId?: string;
}

// WebSocket message types
export type WebSocketMessageType = 
  | "join" 
  | "leave" 
  | "chat" 
  | "info" 
  | "error"
  | "typing_start" 
  | "typing_stop"
  | "ping"
  | "pong"
  | "user_joined"
  | "user_left";

// WebSocket message interface
export interface WebSocketMessage {
  type: WebSocketMessageType;
  message?: string;
  personName?: string;
  personId?: string;
  roomId?: string;
  timestamp?: number;
  userName?: string; // For backward compatibility
  userId?: string;   // For backward compatibility
}

// Typing user interface
export interface TypingUser {
  personId: string;
  personName: string;
  timestamp: number;
}

// Room information
export interface RoomInfo {
  roomId: string;
  participants: string[];
  createdAt: number;
}

// User information
export interface UserInfo {
  userId: string;
  userName: string;
  joinedAt: number;
  isActive: boolean;
}

// WebSocket connection state
export interface WebSocketState {
  socket: WebSocket | null;
  connectionStatus: ConnectionStatus;
  lastConnectedAt?: number;
  reconnectAttempts: number;
}

// Chat room state
export interface ChatRoomState {
  roomCode: string;
  userName: string;
  userId: string;
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  connectionStatus: ConnectionStatus;
}

// Error types
export interface ChatError {
  type: 'connection' | 'message' | 'validation' | 'unknown';
  message: string;
  timestamp: number;
  details?: unknown;
}

// Events for analytics/logging
export interface ChatEvent {
  type: 'message_sent' | 'message_received' | 'user_joined' | 'user_left' | 'typing_started' | 'typing_stopped';
  userId: string;
  roomId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}