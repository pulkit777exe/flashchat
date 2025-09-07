import { useCallback, useRef } from "react";

// Configuration constants
const TYPING_DEBOUNCE_DELAY = 300;
const TYPING_STOP_DELAY = 2000;

interface UseTypingIndicatorReturn {
  handleTyping: (event: React.ChangeEvent<HTMLInputElement>) => void;
  stopTyping: () => void;
  isTyping: boolean;
}

export const useTypingIndicator = (
  sendTypingIndicator: (isTyping: boolean) => void
): UseTypingIndicatorReturn => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastValueRef = useRef<string>("");

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
  }, []);

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingIndicator(true);
    }
    
    // Clear existing stop timeout
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }

    // Set new stop timeout
    stopTypingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendTypingIndicator(false);
      }
    }, TYPING_STOP_DELAY);
  }, [sendTypingIndicator]);

  // Stop typing indicator immediately
  const stopTyping = useCallback(() => {
    clearTimeouts();
    
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingIndicator(false);
    }
  }, [sendTypingIndicator, clearTimeouts]);

  // Handle input change with debouncing
  const handleTyping = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    
    // Don't trigger typing indicator if value hasn't changed
    if (currentValue === lastValueRef.current) {
      return;
    }
    
    lastValueRef.current = currentValue;
    
    // If input is empty, stop typing immediately
    if (currentValue.trim() === "") {
      stopTyping();
      return;
    }

    // Clear existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set debounced typing start
    typingTimeoutRef.current = setTimeout(() => {
      startTyping();
    }, TYPING_DEBOUNCE_DELAY);
  }, [startTyping, stopTyping]);

  return {
    handleTyping,
    stopTyping,
    isTyping: isTypingRef.current,
  };
};