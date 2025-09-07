import { useEffect, useCallback, useRef } from "react";
import { useSetRecoilState } from "recoil";
import {
  MessagesAtom,
  TypingUsersAtom,
  ConnectionStatusAtom
} from "../store/atoms";
import { WebSocketMessage, ChatMessage } from "../types/chat";

// Configuration constants
const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 30000;
const TYPING_CLEANUP_INTERVAL = 5000;

interface ConnectionParams {
  roomCode: string;
  userName: string;
  userId: string;
}

// Global connection manager to prevent multiple instances
class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager | null = null;
  private socket: WebSocket | null = null;
  private connectionParams: ConnectionParams | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private typingCleanupInterval: NodeJS.Timeout | null = null;
  private subscribers = new Set<{
    onStatusChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
    onMessage: (message: ChatMessage) => void;
    onTypingStart: (user: { personId: string; personName: string; timestamp: number }) => void;
    onTypingStop: (personId: string) => void;
  }>();

  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager();
    }
    return WebSocketConnectionManager.instance;
  }

  subscribe(subscriber: {
    onStatusChange: (status: 'disconnected' | 'connecting' | 'connected') => void;
    onMessage: (message: ChatMessage) => void;
    onTypingStart: (user: { personId: string; personName: string; timestamp: number }) => void;
    onTypingStop: (personId: string) => void;
  }) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notifyStatusChange(status: 'disconnected' | 'connecting' | 'connected') {
    this.subscribers.forEach(sub => sub.onStatusChange(status));
  }

  private notifyMessage(message: ChatMessage) {
    this.subscribers.forEach(sub => sub.onMessage(message));
  }

  private notifyTypingStart(user: { personId: string; personName: string; timestamp: number }) {
    this.subscribers.forEach(sub => sub.onTypingStart(user));
  }

  private notifyTypingStop(personId: string) {
    this.subscribers.forEach(sub => sub.onTypingStop(personId));
  }

  private clearTimeouts() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.typingCleanupInterval) {
      clearInterval(this.typingCleanupInterval);
      this.typingCleanupInterval = null;
    }
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);
  }

  private handleMessage = (event: MessageEvent) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      switch (data.type) {
        case "chat":
        case "info": {
          const message: ChatMessage = {
            id: `${data.personId || "system"}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: data.type,
            message: data.message || "",
            personName: data.personName || "System",
            personId: data.personId || "system",
            timestamp: data.timestamp || Date.now(),
            roomId: data.roomId,
          };
          
          this.notifyMessage(message);
          break;
        }

        case "typing_start": {
          if (data.personId && data.personName && this.connectionParams && data.personId !== this.connectionParams.userId) {
            this.notifyTypingStart({
              personId: data.personId,
              personName: data.personName,
              timestamp: Date.now(),
            });
          }
          break;
        }

        case "typing_stop": {
          if (data.personId) {
            this.notifyTypingStop(data.personId);
          }
          break;
        }

        case "pong":
          // Heartbeat response - connection is alive
          break;

        case "error": {
          console.error("WebSocket server error:", data.message);
          break;
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error, event.data);
    }
  };

  private attemptReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS || !this.connectionParams) {
      console.log("Max reconnection attempts reached or no connection params");
      this.notifyStatusChange("disconnected");
      return;
    }

    this.reconnectAttempts += 1;
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    
    this.notifyStatusChange("connecting");
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.connectionParams) {
        const { roomCode, userName, userId } = this.connectionParams;
        this.connect(roomCode, userName, userId);
      }
    }, RECONNECT_DELAY * this.reconnectAttempts);
  }

  connect(roomCode: string, userName: string, userId: string) {
    // Prevent multiple connections
    if (this.isConnecting || this.socket?.readyState === WebSocket.OPEN) {
      console.log("Already connected or connecting");
      return;
    }

    // Close existing connection
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isConnecting = true;
    this.connectionParams = { roomCode, userName, userId };
    this.notifyStatusChange("connecting");

    const configuredUrl = import.meta.env.VITE_WEBSOCKET_URL as string | undefined;
    const WEBSOCKET_URL = configuredUrl || "ws://localhost:8080";

    try {
      console.log(`Connecting to WebSocket: ${WEBSOCKET_URL}`);
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log("WebSocket connection established");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyStatusChange("connected");

        ws.send(JSON.stringify({
          type: "join",
          roomId: roomCode,
          personName: userName,
          personId: userId,
        }));

        this.setupHeartbeat();
      };

      ws.onmessage = this.handleMessage;

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.notifyStatusChange("disconnected");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        this.isConnecting = false;
        this.clearTimeouts();
        
        if (event.code !== 1000 && this.connectionParams) {
          this.notifyStatusChange("disconnected");
          this.attemptReconnect();
        } else {
          this.notifyStatusChange("disconnected");
        }
      };

      this.socket = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.isConnecting = false;
      this.notifyStatusChange("disconnected");
      this.attemptReconnect();
    }
  }

  disconnect() {
    console.log("Disconnecting WebSocket");
    
    this.connectionParams = null;
    this.reconnectAttempts = 0;
    this.clearTimeouts();

    if (this.socket) {
      this.socket.close(1000, "User disconnected");
      this.socket = null;
    }
    
    this.notifyStatusChange("disconnected");
  }

  sendMessage(message: string, roomCode: string, userName: string, userId: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Cannot send message: WebSocket not connected");
      return false;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      console.warn("Cannot send empty message");
      return false;
    }

    try {
      this.socket.send(JSON.stringify({
        type: "chat",
        message: trimmedMessage,
        roomId: roomCode,
        personName: userName,
        personId: userId,
      }));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  sendTypingIndicator(isTyping: boolean, roomCode: string, userName: string, userId: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.socket.send(JSON.stringify({
        type: isTyping ? "typing_start" : "typing_stop",
        roomId: roomCode,
        personName: userName,
        personId: userId,
      }));
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    if (this.isConnecting) return 'connecting';
    if (this.socket?.readyState === WebSocket.OPEN) return 'connected';
    return 'disconnected';
  }

  cleanup() {
    this.clearTimeouts();
    if (this.socket) {
      this.socket.close(1000, "Cleanup");
      this.socket = null;
    }
    this.subscribers.clear();
    WebSocketConnectionManager.instance = null;
  }
}

export const useWebSocketManager = () => {
  // const [socket, setSocket] = useRecoilState(WebSocketAtom);
  const setMessages = useSetRecoilState(MessagesAtom);
  const setTypingUsers = useSetRecoilState(TypingUsersAtom);
  const setConnectionStatus = useSetRecoilState(ConnectionStatusAtom);
  
  const managerRef = useRef<WebSocketConnectionManager | null>(null);

  // Get singleton instance
  if (!managerRef.current) {
    managerRef.current = WebSocketConnectionManager.getInstance();
  }

  const manager = managerRef.current;

  useEffect(() => {
    const unsubscribe = manager.subscribe({
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      onTypingStart: (user) => {
        setTypingUsers(prev => {
          const exists = prev.some(u => u.personId === user.personId);
          if (!exists) {
            return [...prev, user];
          }
          return prev.map(u => 
            u.personId === user.personId 
              ? { ...u, timestamp: user.timestamp }
              : u
          );
        });
      },
      onTypingStop: (personId) => {
        setTypingUsers(prev => prev.filter(user => user.personId !== personId));
      }
    });

    return unsubscribe;
  }, [manager, setConnectionStatus, setMessages, setTypingUsers]);

  // Typing users cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(user => Date.now() - user.timestamp < TYPING_CLEANUP_INTERVAL)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [setTypingUsers]);

  const connect = useCallback((roomCode: string, userName: string, userId: string) => {
    manager.connect(roomCode, userName, userId);
  }, [manager]);

  const disconnect = useCallback(() => {
    manager.disconnect();
  }, [manager]);

  const sendMessage = useCallback((
    message: string,
    roomCode: string,
    userName: string,
    userId: string
  ): boolean => {
    return manager.sendMessage(message, roomCode, userName, userId);
  }, [manager]);

  const sendTypingIndicator = useCallback((
    isTyping: boolean,
    roomCode: string,
    userName: string,
    userId: string
  ): void => {
    manager.sendTypingIndicator(isTyping, roomCode, userName, userId);
  }, [manager]);

  // Cleanup on unmount - but only if this is the last component using it
  useEffect(() => {
    return () => {
      // Don't cleanup the singleton here as other components might still be using it
      // Cleanup happens when all components unmount or on page refresh
    };
  }, []);

  return {
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
    isConnecting: manager.getConnectionStatus() === 'connecting',
  };
};