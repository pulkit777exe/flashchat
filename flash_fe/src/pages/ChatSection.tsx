import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { 
  UserNameAtom, 
  UserIdAtom,
  InputRoomCodeAtom, 
  RoomCode, 
  RoomOpenAtom,
  MessagesAtom,
  TypingUsersAtom,
  ConnectionStatusAtom 
} from '../store/atoms';
import { ChatIcon } from '../icons/ChatIcon';
import { validateRoomCode, validateUserName } from '../utils/validation';
import { generateRoomCode } from '../utils/roomCodeGenerator';
import { CopyRoomCodeButton } from '../components/CopyRoomCodeButton';

export default function ChatSection () {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ userName?: string; roomCode?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const userName = useRecoilValue(UserNameAtom);
  const setUserName = useSetRecoilState(UserNameAtom);
  const userId = useRecoilValue(UserIdAtom);
  const setUserId = useSetRecoilState(UserIdAtom);
  const roomCode = useRecoilValue(RoomCode);
  const setRoomCode = useSetRecoilState(RoomCode);
  const inputRoomCode = useRecoilValue(InputRoomCodeAtom);
  const setInputRoomCode = useSetRecoilState(InputRoomCodeAtom);
  const roomOpen = useRecoilValue(RoomOpenAtom);
  const setRoomOpen = useSetRecoilState(RoomOpenAtom);

  // Reset chat state when component mounts
  const setMessages = useSetRecoilState(MessagesAtom);
  const setTypingUsers = useSetRecoilState(TypingUsersAtom);
  const setConnectionStatus = useSetRecoilState(ConnectionStatusAtom);

  useEffect(() => {
    console.log('ChatSection mounted');
    // Generate userId if not exists
    if (!userId) {
      const newUserId = uuidv4();
      console.log('Generated new userId:', newUserId);
      setUserId(newUserId);
    }
    
    // Reset chat state
    setMessages([]);
    setTypingUsers([]);
    setConnectionStatus("disconnected");
  }, [userId, setUserId, setMessages, setTypingUsers, setConnectionStatus]);

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreateRoom = async () => {
    console.log('Creating room with userName:', userName);
    
    if (!validateUserName(userName)) {
      setErrors({ userName: 'Name must be 2-20 characters long and contain only letters, numbers, and spaces' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const newRoomCode = generateRoomCode();
      console.log('Generated room code:', newRoomCode);
      setRoomCode(newRoomCode);
      setRoomOpen(true);
      setNotification({
        type: 'success',
        message: 'Room created successfully! Share the room code with others.'
      });
      
      setTimeout(() => {
        const currentUserId = userId || uuidv4();
        console.log('Navigating to chat with:', { roomCode: newRoomCode, userName, userId: currentUserId });
        navigate('/chat', { 
          state: { 
            roomCode: newRoomCode, 
            userName, 
            userId: currentUserId
          } 
        });
      }, 500);
    } catch (error) {
      console.error('Error creating room:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create room. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    console.log('Joining room with:', { userName, inputRoomCode });
    
    const validationErrors: { userName?: string; roomCode?: string } = {};

    if (!validateUserName(userName)) {
      validationErrors.userName = 'Name must be 2-20 characters long and contain only letters, numbers, and spaces';
    }

    if (!validateRoomCode(inputRoomCode)) {
      validationErrors.roomCode = 'Room code must be exactly 6 characters long and contain only letters and numbers';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      setRoomCode(inputRoomCode);
      setNotification({
        type: 'success',
        message: 'Joining room...'
      });
      
      setTimeout(() => {
        const currentUserId = userId || uuidv4();
        console.log('Navigating to chat with:', { roomCode: inputRoomCode, userName, userId: currentUserId });
        navigate('/chat', { 
          state: { 
            roomCode: inputRoomCode, 
            userName, 
            userId: currentUserId
          } 
        });
      }, 500);
    } catch (error) {
      console.error('Error joining room:', error);
      setNotification({
        type: 'error',
        message: 'Failed to join room. Please check the room code and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setUserName(value);
    if (errors.userName) {
      setErrors(prev => ({ ...prev, userName: undefined }));
    }
  };

  const handleRoomCodeChange = (value: string) => {
    const upperCaseValue = value.toUpperCase().slice(0, 6);
    setInputRoomCode(upperCaseValue);
    if (errors.roomCode) {
      setErrors(prev => ({ ...prev, roomCode: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-silver text-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-silver/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-white/5 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-silver/20 p-3 rounded-xl">
              <ChatIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Join FlashChat</h1>
          <p className="text-gray-300 mt-2">Enter your name and room details</p>
        </div>

        {/* Form */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-silver/20 space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={userName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                errors.userName 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-silver/30 focus:ring-silver/50'
              }`}
              disabled={isLoading}
            />
            {errors.userName && (
              <p className="text-red-400 text-sm mt-1">{errors.userName}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Create Room */}
            <button
              onClick={handleCreateRoom}
              disabled={isLoading || !userName.trim()}
              className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-silver disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isLoading ? 'Creating...' : 'Create New Room'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-silver/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/50 text-gray-400">or</span>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="space-y-3">
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300">
                Room Code
              </label>
              <input
                id="roomCode"
                type="text"
                value={inputRoomCode}
                onChange={(e) => handleRoomCodeChange(e.target.value)}
                placeholder="ABCD12"
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-mono tracking-wider ${
                  errors.roomCode 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-silver/30 focus:ring-silver/50'
                }`}
                disabled={isLoading}
                maxLength={6}
              />
              {errors.roomCode && (
                <p className="text-red-400 text-sm">{errors.roomCode}</p>
              )}
              
              <button
                onClick={handleJoinRoom}
                disabled={isLoading || !userName.trim() || !inputRoomCode.trim()}
                className="w-full bg-silver/20 text-white font-semibold py-3 rounded-lg hover:bg-silver/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 border border-silver/30"
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>

          {/* Show room code if room is created */}
          {roomOpen && roomCode && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-medium">Room Created!</p>
                  <p className="text-sm text-gray-300">Code: <span className="font-mono font-bold">{roomCode}</span></p>
                </div>
                <CopyRoomCodeButton roomCode={roomCode} />
              </div>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
