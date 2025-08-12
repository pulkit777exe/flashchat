import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { UserNameAtom } from '../store/atoms/UserNameAtom';
import { InputRoomCodeAtom } from '../store/atoms/InputRoomCodeAtom';
import { RoomCode } from '../store/atoms/RoomCodeAtom';
import { RoomOpenAtom } from '../store/atoms/RoomOpenAtom';
import { ChatIcon } from '../icons/ChatIcon';
import { validateRoomCode, validateUserName } from '../utils/validation';
import { generateRoomCode } from '../utils/roomCodeGenerator';

export const ChatSection: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ userName?: string; roomCode?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const userName = useRecoilValue(UserNameAtom);
  const setUserName = useSetRecoilState(UserNameAtom);
  const roomCode = useRecoilValue(RoomCode);
  const setRoomCode = useSetRecoilState(RoomCode);
  const inputRoomCode = useRecoilValue(InputRoomCodeAtom);
  const setInputRoomCode = useSetRecoilState(InputRoomCodeAtom);
  const roomOpen = useRecoilValue(RoomOpenAtom);
  const setRoomOpen = useSetRecoilState(RoomOpenAtom);

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreateRoom = async () => {
    if (!validateUserName(userName)) {
      setErrors({ userName: 'Name must be 2-20 characters long and contain only letters, numbers, and spaces' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const newRoomCode = generateRoomCode();
      setRoomCode(newRoomCode);
      setRoomOpen(true);
      setNotification({
        type: 'success',
        message: `Room ${newRoomCode} created successfully!`
      });
    } catch (error) {
      console.error('Failed to create room:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create room. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const newErrors: { userName?: string; roomCode?: string } = {};

    if (!validateUserName(userName)) {
      newErrors.userName = 'Name must be 2-20 characters long and contain only letters, numbers, and spaces';
    }

    if (!validateRoomCode(inputRoomCode)) {
      newErrors.roomCode = 'Room code must be exactly 6 characters (letters and numbers only)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Navigate to chat room
      navigate('/chat', {
        state: {
          roomCode: inputRoomCode.toUpperCase(),
          userName: userName.trim(),
          userId: uuidv4(),
        },
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      setErrors({ roomCode: 'Failed to join room. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setNotification({
        type: 'success',
        message: 'Room code copied to clipboard!'
      });
    } catch (error) {
      console.error('Failed to copy room code:', error);
      setNotification({
        type: 'error',
        message: 'Failed to copy room code'
      });
    }
  };

  const navigateToCreatedRoom = () => {
    navigate('/chat', {
      state: {
        roomCode,
        userName: userName.trim(),
        userId: uuidv4(),
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'create' | 'join') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (action === 'create') {
        handleCreateRoom();
      } else {
        handleJoinRoom();
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-4">
      <div className="border border-gray-700/50 p-8 min-w-[360px] shadow-2xl rounded-2xl w-full max-w-md bg-gray-800/50 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 text-2xl font-bold mb-2">
            <ChatIcon />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FlashChat
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Create a temporary room or join an existing one to start chatting.
          </p>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg text-sm border ${
            notification.type === 'success' 
              ? 'bg-green-600/20 text-green-300 border-green-600/30' 
              : 'bg-red-600/20 text-red-300 border-red-600/30'
          }`}>
            <div className="flex items-center gap-2">
              <span>{notification.type === 'success' ? '✅' : '❌'}</span>
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* User Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setErrors(prev => ({ ...prev, userName: undefined }));
            }}
            onKeyPress={(e) => handleKeyPress(e, 'create')}
            className={`w-full border ${
              errors.userName ? 'border-red-500' : 'border-gray-600'
            } p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            maxLength={20}
            autoComplete="name"
          />
          {errors.userName && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <span>⚠️</span>
              {errors.userName}
            </p>
          )}
        </div>

        {/* Create Room */}
        <div className="mb-6">
          <button
            onClick={handleCreateRoom}
            disabled={isLoading || !userName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Room...
              </div>
            ) : (
              'Create New Room'
            )}
          </button>
        </div>

        <div className="text-center text-gray-500 mb-6 relative">
          <span className="bg-gray-800/50 px-4">or</span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
        </div>

        {/* Join Room */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit code..."
                value={inputRoomCode}
                onChange={(e) => {
                  setInputRoomCode(e.target.value.toUpperCase());
                  setErrors(prev => ({ ...prev, roomCode: undefined }));
                }}
                onKeyPress={(e) => handleKeyPress(e, 'join')}
                className={`flex-1 border ${
                  errors.roomCode ? 'border-red-500' : 'border-gray-600'
                } p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono tracking-wider`}
                maxLength={6}
                autoComplete="off"
              />
              <button
                onClick={handleJoinRoom}
                disabled={isLoading || !userName.trim() || !inputRoomCode.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Join'
                )}
              </button>
            </div>
            {errors.roomCode && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {errors.roomCode}
              </p>
            )}
          </div>
        </div>

        {/* Room Created Display */}
        {roomOpen && roomCode && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 mt-8 p-4 rounded-xl border border-blue-600/30 backdrop-blur-sm">
            <p className="text-sm text-blue-200 mb-3 text-center">
              🎉 Room created successfully! Share this code with others:
            </p>
            <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg mb-4 border border-gray-600/50">
              <span className="text-2xl font-mono text-white tracking-wider font-bold">
                {roomCode}
              </span>
              <button
                onClick={handleCopyRoomCode}
                className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-md hover:bg-blue-600/20"
                title="Copy room code"
              >
                <span className="text-xl">📋</span>
              </button>
            </div>
            <button
              onClick={navigateToCreatedRoom}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-semibold hover:shadow-lg hover:scale-[1.02]"
            >
              Enter Room →
            </button>
          </div>
        )}

        {/* Back to home link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
