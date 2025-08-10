import { useEffect, useRef, useState } from "react";
import { ChatMessage, TypingIndicator } from "../types/chat";

interface UseWebSocketProps {
  roomCode: string;
  userName: string;
  userId: string;
}

export function useWebSocket({ roomCode, userName, userId }: UseWebSocketProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
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
      const data = JSON.parse(event.data);

      if (data.type === "chat" || data.type === "info") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "typing_start") {
        if (!typingUsers.some((user) => user.personName === data.userName)) {
          setTypingUsers((prev) => [
            ...prev,
            { personName: data.userName, timestamp: Date.now() },
          ]);
        }
      } else if (data.type === "typing_stop") {
        setTypingUsers((prev) =>
          prev.filter((user) => user.personName !== data.userName)
        );
      }
    };

    ws.onclose = () => console.log("WebSocket closed");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    setSocket(ws);

    return () => ws.close();
  }, [roomCode, userName, userId]);

  const sendMessage = (message: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat",
          message,
          roomId: roomCode,
          personName: userName,
          personId: userId,
        })
      );
      stopTyping();
    }
  };

  const startTyping = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    if (!typingTimeoutRef.current) {
      socket.send(
        JSON.stringify({
          type: "typing_start",
          roomId: roomCode,
          personName: userName,
          personId: userId,
        })
      );
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1500) as unknown as number;
  };

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "typing_stop",
          roomId: roomCode,
          personName: userName,
          personId: userId,
        })
      );
    }
  };

  return {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
  };
}
