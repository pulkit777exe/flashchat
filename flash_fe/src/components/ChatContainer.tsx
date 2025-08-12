import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { MessageBubble } from './MessageBubble';
import { TypingIndicatorComponent } from './TypingIndicator';
import { ConnectionStatus } from './ConnectionStatus';

export const ChatContainer: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleSendMessage = () => {
    const message = inputValue.trim();
    if (message && sendMessage(message)) {
      setInputValue('');
      stopTyping();
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    handleTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!roomCode || !userName || !userId) {
    return null; // Will redirect
  }

  return (
    <div className="h-screen flex justify-center items-center bg-gray-900 text-white p-4">
      <div className="flex flex-col border border-gray-700 h-full max-h-[700px] w-full max-w-2xl rounded-lg bg-gray-800 shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-750 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">Room: {roomCode}</h2>
              <p className="text-sm text-gray-400">Logged in as {userName}</p>
            </div>
            <button
              onClick={() => navigate('/join')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Leave Room
            </button>
          </div>
          <ConnectionStatus status={connectionStatus} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.personId === userId}
              />
            ))
          )}
          <TypingIndicatorComponent
            typingUsers={typingUsers}
            currentUserName={userName}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 bg-gray-750 rounded-b-lg">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={connectionStatus !== 'connected'}
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || connectionStatus !== 'connected'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Send
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};