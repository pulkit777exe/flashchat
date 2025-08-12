import React from 'react';
import { useRoomActions } from '../hooks/useRoomActions';

interface EnterRoomButtonProps {
  roomCode?: string;
  className?: string;
  children?: React.ReactNode;
}

export const EnterRoomButton: React.FC<EnterRoomButtonProps> = ({
  roomCode,
  className = "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-medium",
  children = "Enter Room"
}) => {
  const { navigateToRoom, isLoading } = useRoomActions();

  const handleEnterRoom = () => {
    navigateToRoom(roomCode);
  };

  return (
    <button
      onClick={handleEnterRoom}
      disabled={isLoading}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
};
