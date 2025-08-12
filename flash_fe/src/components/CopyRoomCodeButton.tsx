import React from 'react';
import { useRecoilValue } from 'recoil';
import { RoomCode } from '../store/atoms/RoomCodeAtom';
import { useClipboard } from '../hooks/useClipboard';
import { CopyIcon } from '../icons/CopyIcon';

interface CopyRoomCodeButtonProps {
  roomCode?: string;
  className?: string;
  showText?: boolean;
  onCopySuccess?: () => void;
  onCopyError?: (error: string) => void;
}

export const CopyRoomCodeButton: React.FC<CopyRoomCodeButtonProps> = ({
  roomCode: propRoomCode,
  className = "text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-md hover:bg-gray-700",
  showText = false,
  onCopySuccess,
  onCopyError
}) => {
  const recoilRoomCode = useRecoilValue(RoomCode);
  const { copyToClipboard, isCopying, copySuccess, copyError } = useClipboard();
  
  const roomCodeToCopy = propRoomCode || recoilRoomCode;

  const handleCopy = async () => {
    if (!roomCodeToCopy) return;
    
    const success = await copyToClipboard(roomCodeToCopy);
    
    if (success) {
      onCopySuccess?.();
    } else if (copyError) {
      onCopyError?.(copyError);
    }
  };

  if (!roomCodeToCopy) return null;

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        disabled={isCopying}
        className={className}
        title={copySuccess ? 'Copied!' : 'Copy room code'}
        type="button"
      >
        <div className="flex items-center gap-2">
          <CopyIcon />
          {showText && (
            <span className="text-sm">
              {isCopying ? 'Copying...' : copySuccess ? 'Copied!' : 'Copy'}
            </span>
          )}
        </div>
      </button>
      
      {/* Success/Error feedback */}
      {copySuccess && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded">
          Copied!
        </div>
      )}
      {copyError && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded">
          Failed to copy
        </div>
      )}
    </div>
  );
};

