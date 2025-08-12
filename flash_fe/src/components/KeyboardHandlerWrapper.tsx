import React from 'react';
import { createEnterKeyHandler } from '../utils/keyboardHandlers.ts';

interface KeyboardHandlerWrapperProps {
  onEnterPress: () => void;
  children: React.ReactNode;
  className?: string;
}

export const KeyboardHandlerWrapper: React.FC<KeyboardHandlerWrapperProps> = ({
  onEnterPress,
  children,
  className
}) => {
  const handleKeyDown = createEnterKeyHandler(onEnterPress);

  return (
    <div onKeyDown={handleKeyDown} className={className}>
      {children}
    </div>
  );
};
