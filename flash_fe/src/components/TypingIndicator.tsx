import React from 'react';
import { TypingIndicator } from '../types/chat';

interface TypingIndicatorProps {
  typingUsers: TypingIndicator[];
  currentUserName: string;
}

export const TypingIndicatorComponent: React.FC<TypingIndicatorProps> = ({ 
  typingUsers, 
  currentUserName 
}) => {
  const otherTypingUsers = typingUsers.filter(user => user.personName !== currentUserName);
  const count = otherTypingUsers.length;

  if (count === 0) return null;

  const getTypingText = () => {
    if (count === 1) return `${otherTypingUsers[0].personName} is typing...`;
    if (count === 2) return `${otherTypingUsers[0].personName} and ${otherTypingUsers[1].personName} are typing...`;
    return `${otherTypingUsers[0].personName} and ${count - 1} other${count - 1 > 1 ? 's' : ''} are typing...`;
  };

  return (
    <div className="self-start text-gray-400 text-sm italic mt-2 px-3">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>{getTypingText()}</span>
      </div>
    </div>
  );
};