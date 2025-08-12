import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatMessage } from "../types/chat";
import { useWebSocket } from "../hooks/useWebSocket";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { TypingIndicatorComponent } from "../components/TypingIndicator";
import { MessageBubble } from "../components/MessageBubble";
import { ConnectionStatus } from "../components/ConnectionStatus";

export default function ContainerSection () {
  const inputRef = useRef<HTMLInputElement>(null);
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

  const {
    messages,
    typingUsers,
    connectionStatus,
    sendMessage,
    sendTypingIndicator,
  } = useWebSocket({ roomCode, userName, userId });

  const { handleTyping, stopTyping } = useTypingIndicator(sendTypingIndicator);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const lastMessageCountRef = useRef<number>(0);
  useEffect(() => {
    if (messages.length !== lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      scrollToBottom();
    }
  }, [messages]);

  const sendHandler = () => {
    const value = inputRef.current?.value?.trim();
    if (!value) return;

    const sent = sendMessage(value);
    if (sent && inputRef.current) {
      inputRef.current.value = "";
    }
    stopTyping();
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
            <ConnectionStatus status={connectionStatus} />
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
            messages.map((msg: ChatMessage, idx: number) => (
              <MessageBubble
                key={msg.id || idx}
                message={msg}
                isCurrentUser={msg.personId === userId}
              />
            ))
          )}
          <TypingIndicatorComponent typingUsers={typingUsers} currentUserName={userName} />
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
              onChange={handleTyping}
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