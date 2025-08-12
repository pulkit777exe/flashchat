import React from 'react';
import { ChatMessage } from '../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.type === 'info') {
    return (
      <div className="text-gray-400 self-center text-sm italic text-center w-full py-2">
        {message.message}
      </div>
    );
  }

  return (
    <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'self-end items-end' : 'self-start items-start'}`}>
      <div
        className={`p-3 rounded-lg ${
          isCurrentUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-white rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <div className="text-xs text-gray-300 mb-1 font-medium">
            {message.personName}
          </div>
        )}
        <div className="break-words">{message.message}</div>
      </div>
      <div className="text-xs text-gray-500 mt-1 px-1">
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
};