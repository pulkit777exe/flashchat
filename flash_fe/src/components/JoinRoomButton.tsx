import React from 'react';
import { useRoomActions } from '../hooks/useRoomActions';

interface JoinRoomButtonProps {
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const JoinRoomButton: React.FC<JoinRoomButtonProps> = ({
  className = "bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors",
  children = "Join",
  onSuccess,
  onError
}) => {
  const { joinRoom, isLoading, getErrorByField } = useRoomActions();

  const handleJoinRoom = async () => {
    const result = await joinRoom();
    
    if (result.success) {
      onSuccess?.();
    } else if (result.error) {
      onError?.(result.error);
    }
  };

  const error = getErrorByField('userName') || getErrorByField('roomCode') || getErrorByField('general');

  return (
    <div>
      <button
        onClick={handleJoinRoom}
        disabled={isLoading}
        className={className}
        type="button"
      >
        {isLoading ? 'Joining...' : children}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};