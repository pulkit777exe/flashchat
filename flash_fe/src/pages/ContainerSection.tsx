import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatMessage, TypingIndicator, TimeoutId } from "../types/chat";

export const ContainerSection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const location = useLocation();
  const { roomCode, userName, userId } = location.state || {};

  // Redirect if missing required data
  useEffect(() => {
    if (!roomCode || !userName || !userId) {
      navigate('/join');
    }
  }, [roomCode, userName, userId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!roomCode || !userName || !userId) return;

    setConnectionStatus('connecting');

    const VITE_WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
    const VITE_WEBSOCKET_PORT = import.meta.env.VITE_WEBSOCKET_PORT;
    
    let url: string;
    if (VITE_WEBSOCKET_URL && VITE_WEBSOCKET_PORT) {
      url = `${VITE_WEBSOCKET_URL}:${VITE_WEBSOCKET_PORT}`;
    } else {
      url = "ws://localhost:8080";
      console.warn("Using default WebSocket URL. Set environment variables for production.");
    }

    console.log("Connecting to WebSocket server at", url);
    
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("Connected to server");
        setConnectionStatus('connected');
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
          const data = JSON.parse(event.data);
          
          if (data.type === "chat" || data.type === "info") {
            setMessages((prev) => [...prev, {
              ...data,
              id: data.id || `${data.personId}-${Date.now()}`,
              timestamp: data.timestamp || Date.now()
            }]);
          } else if (data.type === "typing_start") {
            setTypingUsers((prev) => {
              if (!prev.some((u) => u.personId === data.personId)) {
                return [
                  ...prev,
                  {
                    personId: data.personId,
                    personName: data.personName,
                    timestamp: Date.now(),
                  },
                ];
              }
              return prev;
            });
          } else if (data.type === "typing_stop") {
            setTypingUsers((prev) =>
              prev.filter((user) => 
                user.personId !== data.personId && 
                user.personName !== data.userName
              )
            );
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus('disconnected');
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus('disconnected');
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionStatus('disconnected');
    }
  }, [roomCode, userName, userId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const typingTimeoutRef = useRef<TimeoutId | null>(null);

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
          personId: userId,
        })
      );
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "typing_stop",
            roomId: roomCode,
            personName: userName,
            personId: userId,
          })
        );
      }
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const sendHandler = () => {
    const value = inputRef.current?.value?.trim();

    if (!value || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        message: value,
        roomId: roomCode,
        personName: userName,
        personId: userId,
      })
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    socket.send(
      JSON.stringify({
        type: "typing_stop",
        roomId: roomCode,
        personName: userName,
        personId: userId,
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
    return `${otherTypingUsers[0].personName} + ${count - 1} other${
      count - 1 > 1 ? "s" : ""
    } are typing...`;
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Don't render if missing required data
  if (!roomCode || !userName || !userId) {
    return null;
  }

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-inter p-4">
      <div className="flex flex-col border border-gray-700/50 min-h-[600px] w-full max-w-2xl rounded-2xl bg-gray-800/50 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/30">
          <div>
            <h2 className="font-bold text-lg">Room: <span className="font-mono text-blue-400">{roomCode}</span></h2>
            <p className="text-sm text-gray-400">Logged in as {userName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </div>
            <button
              onClick={() => navigate('/join')}
              className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1 rounded-md hover:bg-gray-700/50"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>👋 Welcome to the chat room!</p>
              <p className="text-sm mt-1">Start the conversation by sending a message.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.type === "chat"
                    ? msg.personId === userId
                      ? "bg-blue-600 text-white self-end rounded-br-none ml-auto"
                      : "bg-gray-700 text-white self-start rounded-bl-none mr-auto"
                    : "text-gray-400 self-center text-sm italic"
                } ${msg.type === "info" ? "text-center w-full" : ""}`}
              >
                {msg.type === "chat" && (
                  <div>
                    {msg.personId !== userId && (
                      <div className="text-xs text-gray-300 mb-1 font-medium">
                        {msg.personName}
                      </div>
                    )}
                    <div className="break-words">{msg.message}</div>
                  </div>
                )}
                {msg.type === "info" && <span>{msg.message}</span>}
              </div>
            ))
          )}
          {getTypingIndicatorText() && (
            <div className="self-start text-gray-400 text-sm italic mt-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>{getTypingIndicatorText()}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendHandler();
                }
              }}
              onChange={handleInputChange}
              disabled={connectionStatus !== 'connected'}
              className="flex-grow p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendHandler}
              disabled={connectionStatus !== 'connected'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100"
            >
              Send
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};