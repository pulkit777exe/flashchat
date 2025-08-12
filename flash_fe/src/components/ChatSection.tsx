import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { UserNameAtom } from '../store/atoms/UserNameAtom';
import { InputRoomCodeAtom } from '../store/atoms/InputRoomCodeAtom';
import { RoomCode } from '../store/atoms/RoomCodeAtom';
import { RoomOpenAtom } from '../store/atoms/RoomOpenAtom';
import { generateRoomCode, validateRoomCode, validateUserName } from '../utils/validation';
import { ChatIcon } from '../icons/ChatIcon';

export const ChatSection: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ userName?: string; roomCode?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const userName = useRecoilValue(UserNameAtom);
  const setUserName = useSetRecoilState(UserNameAtom);
  const roomCode = useRecoilValue(RoomCode);
  const setRoomCode = useSetRecoilState(RoomCode);
  const inputRoomCode = useRecoilValue(InputRoomCodeAtom);
  const setInputRoomCode = useSetRecoilState(InputRoomCodeAtom);
  const roomOpen = useRecoilValue(RoomOpenAtom);
  const setRoomOpen = useSetRecoilState(RoomOpenAtom);

  const handleCreateRoom = async () => {
    if (!validateUserName(userName)) {
      setErrors({ userName: 'Name must be 2-20 characters long' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const newRoomCode = generateRoomCode();
      setRoomCode(newRoomCode);
      setRoomOpen(true);
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const newErrors: { userName?: string; roomCode?: string } = {};

    if (!validateUserName(userName)) {
      newErrors.userName = 'Name must be 2-20 characters long';
    }

    if (!validateRoomCode(inputRoomCode)) {
      newErrors.roomCode = 'Room code must be 6 characters (letters and numbers)';
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
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy room code:', error);
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

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white px-4">
      <div className="border border-gray-700 p-8 min-w-[360px] shadow-2xl rounded-xl w-full max-w-md bg-gray-800">
        <div className="flex items-center gap-3 text-2xl font-semibold mb-2">
          <ChatIcon />
          <span>FlashChat</span>
        </div>

        <p className="text-gray-400 text-sm mb-8">
          Create a temporary room or join an existing one to start chatting.
        </p>

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
            className={`w-full border ${
              errors.userName ? 'border-red-500' : 'border-gray-600'
            } p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            maxLength={20}
          />
          {errors.userName && (
            <p className="text-red-400 text-sm mt-1">{errors.userName}</p>
          )}
        </div>

        {/* Create Room */}
        <div className="mb-6">
          <button
            onClick={handleCreateRoom}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white p-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create New Room'}
          </button>
        </div>

        <div className="text-center text-gray-500 mb-6">
          <span>or</span>
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
                placeholder="Enter room code..."
                value={inputRoomCode}
                onChange={(e) => {
                  setInputRoomCode(e.target.value.toUpperCase());
                  setErrors(prev => ({ ...prev, roomCode: undefined }));
                }}
                className={`flex-1 border ${
                  errors.roomCode ? 'border-red-500' : 'border-gray-600'
                } p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                maxLength={6}
              />
              <button
                onClick={handleJoinRoom}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {isLoading ? 'Joining...' : 'Join'}
              </button>
            </div>
            {errors.roomCode && (
              <p className="text-red-400 text-sm mt-1">{errors.roomCode}</p>
            )}
          </div>
        </div>

        {/* Room Created Display */}
        {roomOpen && (
          <div className="bg-gray-700 mt-8 p-4 rounded-xl border border-gray-600">
            <p className="text-sm text-gray-300 mb-3">
              Room created successfully! Share this code with others:
            </p>
            <div className="flex items-center justify-between bg-gray-600 p-3 rounded-lg">
              <span className="text-2xl font-mono text-white">{roomCode}</span>
              <button
                onClick={handleCopyRoomCode}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Copy room code"
              >
                📋
              </button>
            </div>
            <button
              onClick={navigateToCreatedRoom}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Enter Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};