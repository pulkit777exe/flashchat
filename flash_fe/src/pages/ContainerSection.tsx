import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChatMessage, TypingIndicator } from "../types/chat";

export const ContainerSection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const { roomCode, userName, userId } = location.state || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    //check for environment variables
    const VITE_WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
    const VITE_WEBSOCKET_PORT = import.meta.env.VITE_WEBSOCKET_PORT;
    if (!VITE_WEBSOCKET_URL || !VITE_WEBSOCKET_PORT) {
      console.error("Missing WebSocket env vars");
      return;
    }
    // const url = `${VITE_WEBSOCKET_URL}:${VITE_WEBSOCKET_PORT}`;

    const url = "ws://localhost:8080";
    console.log("Connecting to WebSocket server at", url);
    // this line has error
    const ws = new WebSocket(url);

    // Event listener for when the WebSocket connection is opened.
    ws.onopen = () => {
      console.log("Connected to server");
      // Send a 'join' message to the server upon successful connection.
      ws.send(
        JSON.stringify({
          type: "join",
          roomId: roomCode,
          personName: userName,
          personId: userId,
        })
      );
    };

    // Event listener for incoming messages from the WebSocket server.
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle different types of messages (chat, info, typing indicators).
      if (data.type === "chat" || data.type === "info") {
        setMessages((prev) => [...prev, data]);
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
        // Remove user from typing list.
        setTypingUsers((prev) =>
          prev.filter((user) => user.personName !== data.userName)
        );
      }
    };

    // Event listener for WebSocket errors.
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Event listener for when the WebSocket connection is closed.
    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    // Set the WebSocket instance in state.
    setSocket(ws);

    // Cleanup function: close the WebSocket connection when the component unmounts.
    return () => ws.close();
  }, [roomCode, userName, userId]); // Dependencies for useEffect: re-run if roomCode or userName changes.

  // Effect to scroll to the bottom of the messages whenever messages or typing users change.
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Ref to store the typing timeout ID. Changed type from NodeJS.Timeout to number.
  const typingTimeoutRef = useRef<number | null>(null);

  // Handler for input field changes (used for typing indicator).
  const handleInputChange = () => {
    // Ensure socket is open before sending typing events.
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    // Clear previous timeout if user is still typing.
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      // Send 'typing_start' only if no timeout is active (first key press).
      socket.send(
        JSON.stringify({
          type: "typing_start",
          roomId: roomCode,
          personName: userName,
          personId: userId,
        })
      );
    }

    // Set a new timeout to send 'typing_stop' after 1.5 seconds of inactivity.
    typingTimeoutRef.current = setTimeout(() => {
      socket.send(
        JSON.stringify({
          type: "typing_stop",
          roomId: roomCode,
          personName: userName,
          personId: userId,
        })
      );
      typingTimeoutRef.current = null; // Reset timeout ref.
    }, 1500) as unknown as number; // Cast to number for compatibility.
  };

  // Handler for sending messages.
  const sendHandler = () => {
    // Get the message value from the input ref.
    // Added null check for inputRef.current.
    const value = inputRef.current?.value;

    // Validate message content and socket state.
    if (!value || !socket || socket.readyState !== WebSocket.OPEN) return;

    // Send the chat message.
    socket.send(
      JSON.stringify({
        type: "chat",
        message: value,
        roomId: roomCode,
        personName: userName,
        personId: userId,
      })
    );
    // Clear the input field.
    if (inputRef.current) {
      // Added null check here
      inputRef.current.value = "";
    }

    // Clear any active typing timeout and send 'typing_stop' immediately after sending message.
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

  // Filter out the current user from the typing users list.
  const otherTypingUsers = typingUsers.filter(
    (user) => user.personName !== userName
  );

  // Function to generate the typing indicator text.
  const getTypingIndicatorText = () => {
    const count = otherTypingUsers.length;
    if (count === 0) return null;
    if (count === 1) return `${otherTypingUsers[0].personName} is typing...`;
    if (count === 2)
      return `${otherTypingUsers[0].personName} and ${otherTypingUsers[1].personName} are typing...`;

    // For more than 2 users, show the first user and a count of others.
    return `${otherTypingUsers[0].personName} + ${count - 1} other${
      count - 1 > 1 ? "s" : ""
    } are typing...`;
  };

  return (
    <div className="h-screen flex justify-center items-center bg-black text-white font-inter">
      {" "}
      {/* Added font-inter class */}
      <div className="flex flex-col border border-gray-800 min-h-[600px] w-[500px] rounded-lg p-4 bg-black shadow-lg">
        {" "}
        {/* Added shadow */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-2 flex flex-col p-2 custom-scrollbar">
          {" "}
          {/* Added custom-scrollbar for better aesthetics */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.type === "chat"
                  ? msg.personId === userId
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
            <div className="self-start text-gray-200 text-sm italic mt-2 animate-pulse">
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
            className="flex-grow p-3 rounded-l-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500" // Improved input styling
          />
          <button
            onClick={sendHandler}
            className="bg-white hover:bg-gray-400 duration-300 text-black px-6 py-3 rounded-r-lg font-bold shadow-md" // Improved button styling
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
