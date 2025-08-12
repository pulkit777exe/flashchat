import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChatMessage,
  TypingIndicator,
  WebSocketMessage,
  TimeoutId,
} from "../types/chat";

interface UseWebSocketProps {
  roomCode: string;
  userName: string;
  userId: string;
}

export const useWebSocket = ({
  roomCode,
  userName,
  userId,
}: UseWebSocketProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const reconnectTimeoutRef = useRef<TimeoutId | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback((): WebSocket | null => {
    if (!roomCode || !userName || !userId) return null;

    setConnectionStatus("connecting");

    const configuredUrl = import.meta.env.VITE_WEBSOCKET_URL as string | undefined;
    const configuredPort = import.meta.env.VITE_WEBSOCKET_PORT as string | undefined;
    const WEBSOCKET_URL = configuredUrl && configuredPort
      ? `${configuredUrl}:${configuredPort}`
      : configuredUrl || "ws://localhost:8080";

    try {
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log("Connected to WebSocket server");
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;

        ws.send(
          JSON.stringify({
            type: "join",
            roomId: roomCode,
            personName: userName,
            personId: userId,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          switch (data.type) {
            case "chat":
            case "info":
              setMessages((prev) => [
                ...prev,
                {
                  id: `${data.personId || "system"}-${Date.now()}`,
                  type: data.type as "chat" | "info",
                  message: data.message || "",
                  personName: data.personName || "",
                  personId: data.personId || "",
                  timestamp: data.timestamp || Date.now(),
                  roomId: data.roomId,
                },
              ]);
              break;

            case "typing_start":
              if (data.personId && data.personId !== userId) {
                setTypingUsers((prev) => {
                  if (!prev.some((u) => u.personId === data.personId)) {
                    return [
                      ...prev,
                      {
                        personId: data.personId!,
                        personName: data.personName!,
                        timestamp: Date.now(),
                      },
                    ];
                  }
                  return prev;
                });
              }
              break;

            case "typing_stop":
              setTypingUsers((prev) =>
                prev.filter(
                  (user) =>
                    user.personId !== data.personId &&
                    user.personName !== data.userName
                )
              );
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("disconnected");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("disconnected");

        if (!event.wasClean && reconnectAttemptsRef.current < 5) {
          const timeout = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            10000
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, timeout);
        }
      };

      setSocket(ws);
      socketRef.current = ws;
      return ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionStatus("disconnected");
      return null;
    }
  }, [roomCode, userName, userId]);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      try {
        (ws || socketRef.current)?.close();
      } catch (e) {
        console.debug("WebSocket close during cleanup failed", e);
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (message: string) => {
      if (socket?.readyState === WebSocket.OPEN && message.trim()) {
        socket.send(
          JSON.stringify({
            type: "chat",
            message: message.trim(),
            roomId: roomCode,
            personName: userName,
            personId: userId,
          })
        );
        return true;
      }
      return false;
    },
    [socket, roomCode, userName, userId]
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: isTyping ? "typing_start" : "typing_stop",
            roomId: roomCode,
            personName: userName,
            personId: userId,
          })
        );
      }
    },
    [socket, roomCode, userName, userId]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => prev.filter((user) => now - user.timestamp < 5000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    socket,
    messages,
    typingUsers,
    connectionStatus,
    sendMessage,
    sendTypingIndicator,
  };
};
