import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWebSocket } from "../../hooks/useWebSocket";
import { TypingIndicatorText } from "../Chat/TypingIndicator";

export const ContainerSection = () => {
  const location = useLocation();
  const { roomCode, userName, userId } = location.state || {};
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, typingUsers, sendMessage, startTyping } = useWebSocket({
    roomCode,
    userName,
    userId,
  });

  const handleSend = () => {
    const value = inputRef.current?.value;
    if (!value) return;
    sendMessage(value);
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  return (
    <div className="h-screen flex justify-center items-center bg-black text-white font-inter">
      <div className="flex flex-col border border-gray-800 min-h-[600px] w-[500px] rounded-lg p-4 bg-black shadow-lg">
        <div className="flex-grow overflow-y-auto mb-4 space-y-2 flex flex-col p-2 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.type === "chat"
                  ? msg.personId === userId
                    ? "bg-gray-600 self-end"
                    : "bg-gray-800 self-start"
                  : "text-gray-400 self-center text-sm italic"
              }`}
            >
              {msg.type === "chat" && (
                <span>
                  <strong>{msg.personName}:</strong> {msg.message}
                </span>
              )}
              {msg.type === "info" && <span>{msg.message}</span>}
            </div>
          ))}
          <div className="text-gray-400 text-sm italic">
            <TypingIndicatorText typingUsers={typingUsers} currentUserName={userName} />
          </div>
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            ref={inputRef}
            onChange={startTyping}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-grow p-3 rounded-l-lg bg-gray-800 text-white"
          />
          <button
            onClick={handleSend}
            className="bg-white text-black px-6 py-3 rounded-r-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
