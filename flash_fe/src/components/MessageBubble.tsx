import { memo } from 'react';
import { ChatMessage } from '../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

// Format timestamp for display
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Escape HTML to prevent XSS
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const MessageBubble = memo<MessageBubbleProps>(({ message, isCurrentUser }) => {
  const isSystemMessage = message.type === 'info' || message.type === 'system';
  const isErrorMessage = message.type === 'error';
  
  if (isSystemMessage) {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-gray-400 bg-gray-800/30 px-3 py-1 rounded-full">
          {escapeHtml(message.message)}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    );
  }

  if (isErrorMessage) {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-red-400 bg-red-900/20 px-3 py-1 rounded-full border border-red-800/30">
          ⚠️ {escapeHtml(message.message)}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isCurrentUser
            ? 'bg-white text-black rounded-br-md'
            : 'bg-gray-700/80 text-white rounded-bl-md'
        }`}>
          {!isCurrentUser && (
            <div className="text-xs font-medium text-gray-300 mb-1">
              {escapeHtml(message.personName)}
            </div>
          )}
          <div className="break-words whitespace-pre-wrap">
            {escapeHtml(message.message)}
          </div>
          <div className={`text-xs mt-1 ${
            isCurrentUser ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
});