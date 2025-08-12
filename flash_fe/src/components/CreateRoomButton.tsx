import React from 'react';
import { useRoomActions } from '../hooks/useRoomActions';

interface CreateRoomButtonProps {
  className?: string;
  children?: React.ReactNode;
  onSuccess?: (roomCode: string) => void;
  onError?: (error: string) => void;
}

export const CreateRoomButton: React.FC<CreateRoomButtonProps> = ({
  className = "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white p-3 rounded-lg font-semibold transition-colors",
  children = "Create New Room",
  onSuccess,
  onError
}) => {
  const { createRoom, isLoading, getErrorByField } = useRoomActions();

  const handleCreateRoom = async () => {
    const result = await createRoom();
    
    if (result.success && result.roomCode) {
      onSuccess?.(result.roomCode);
    } else if (result.error) {
      onError?.(result.error);
    }
  };

  const error = getErrorByField('userName') || getErrorByField('general');

  return (
    <div>
      <button
        onClick={handleCreateRoom}
        disabled={isLoading}
        className={className}
        type="button"
      >
        {isLoading ? 'Creating Room...' : children}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};