import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface ChatMessage {
  personName: string;
  message: string;
  type: "chat" | "info" | "error";
}

interface TypingIndicator {
  personName: string;
  timestamp: number; // To help with timeout/cleanup
}

export const ContainerSection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const { roomCode, userName } = location.state || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to server");
      ws.send(
        JSON.stringify({
          type: "join",
          roomId: roomCode,
          personName: userName,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat" || data.type === "info") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "typing_start") {
        setTypingUsers((prev) => {
          if (!prev.some((user) => user.personName === data.personName)) {
            return [...prev, { personName: data.personName, timestamp: Date.now() }];
          }
          return prev;
        });
      } else if (data.type === "typing_stop") {
        setTypingUsers((prev) =>
          prev.filter((user) => user.personName !== data.personName)
        );
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    setSocket(ws);

    return () => ws.close();
  }, [roomCode, userName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      socket.send(
        JSON.stringify({
          type: "typing_start",
          roomId: roomCode,
          personName: userName,
        })
      );
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.send(
        JSON.stringify({
          type: "typing_stop",
          roomId: roomCode,
          personName: userName,
        })
      );
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const sendHandler = () => {
    const value = inputRef.current?.value;
    if (!value || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        message: value,
        roomId: roomCode,
        personName: userName,
      })
    );
    inputRef.current.value = "";

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socket.send(
      JSON.stringify({
        type: "typing_stop",
        roomId: roomCode,
        personName: userName,
      })
    );
  };

  const otherTypingUsers = typingUsers.filter(
    (user) => user.personName !== userName
  );

  const getTypingIndicatorText = () => {
    const count = otherTypingUsers.length;
    if (count === 0) return null;
    if (count === 1) return `${otherTypingUsers[0].personName} is typing...`;
    if (count === 2)
      return `${otherTypingUsers[0].personName} and ${otherTypingUsers[1].personName} are typing...`;
    
    return `${otherTypingUsers[0].personName} + ${count - 1} other${count - 1 > 1 ? 's' : ''} are typing...`;
  };

  return (
    <div className="h-screen flex justify-center items-center bg-black text-white">
      <div className="flex flex-col border border-gray-800 min-h-[600px] w-[500px] rounded-lg p-4 bg-black">
        <div className="flex-grow overflow-y-auto mb-4 space-y-2 flex flex-col">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              // Added animate-fadeInUp class here
              className={`p-3 rounded-lg max-w-[80%] animate-fadeInUp ${
                msg.type === "chat"
                  ? msg.personName === userName
                    ? "bg-gray-600 text-white self-end rounded-br-none ml-auto"
                    : "bg-gray-800 text-white self-start rounded-bl-none mr-auto"
                  : "text-gray-400 self-center text-sm italic"
              } ${msg.type === "info" ? "text-center w-full" : ""}`}
            >
              {msg.type === "chat" && (
                <span>
                  <strong>{msg.personName}:</strong> {msg.message}
                </span>
              )}
              {msg.type === "info" && <span>{msg.message}</span>}
            </div>
          ))}
          {getTypingIndicatorText() && (
            <div className="self-start text-gray-500 text-sm italic mt-2 animate-pulse">
              {getTypingIndicatorText()}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    sendHandler();
                }
            }}
            onChange={handleInputChange}
            className="flex-grow p-2 rounded-l bg-gray-800 text-white"
          />
          <button
            onClick={sendHandler}
            className="bg-white hover:bg-white/90 duration-300 text-black px-4 rounded-r font-bold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};