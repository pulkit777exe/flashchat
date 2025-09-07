import { memo } from 'react';
import { TypingUser } from '../types/chat';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserName: string;
}

// Animated typing dots component
const TypingDots = memo(() => (
  <div className="flex space-x-1 items-center">
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
  </div>
));

// Format typing users text
const formatTypingText = (users: TypingUser[]): string => {
  const names = users.map(user => user.personName);
  
  if (names.length === 0) return '';
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]} are typing`;
  
  return `${names.slice(0, 2).join(', ')}, and ${names.length - 2} others are typing`;
};

export const TypingIndicatorComponent = memo<TypingIndicatorProps>(({ 
  typingUsers, 
  currentUserName 
}) => {
  // Filter out current user and ensure we have valid users
  const validTypingUsers = typingUsers.filter(
    user => user.personName !== currentUserName && 
            user.personName && 
            user.personId
  );

  if (validTypingUsers.length === 0) {
    return null;
  }

  const typingText = formatTypingText(validTypingUsers);

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 animate-fadeIn">
      <div className="flex-shrink-0">
        <TypingDots />
      </div>
      <span className="truncate">
        {typingText}
      </span>
    </div>
  );
});