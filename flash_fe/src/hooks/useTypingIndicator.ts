import { useRef, useCallback } from 'react';
import { TimeoutId } from '../types/chat';

export const useTypingIndicator = (
  sendTypingIndicator: (isTyping: boolean) => void
) => {
  // Fix: Use TimeoutId instead of number
  const typingTimeoutRef = useRef<TimeoutId | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else if (!isTypingRef.current) {
      // Start typing indicator
      sendTypingIndicator(true);
      isTypingRef.current = true;
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 1500);
  }, [sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current) {
      sendTypingIndicator(false);
      isTypingRef.current = false;
    }
  }, [sendTypingIndicator]);

  return { handleTyping, stopTyping };
};
