import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { RoomOpenAtom } from '../store/atoms/RoomOpenAtom';
import { RoomCode } from '../store/atoms/RoomCodeAtom';
import { UserNameAtom } from '../store/atoms/UserNameAtom';
import { InputRoomCodeAtom } from '../store/atoms/InputRoomCodeAtom';
import { randomStringGen, generateUserId } from '../utils/random';
import { validateRoomCode, validateUserName, sanitizeInput } from '../utils/validation';
import { CreateRoomResult, JoinRoomResult, ValidationError } from '../types/handlers';

export const useRoomActions = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Recoil state
  const roomOpen = useRecoilValue(RoomOpenAtom);
  const setRoomOpen = useSetRecoilState(RoomOpenAtom);
  const roomCode = useRecoilValue(RoomCode);
  const setRoomCode = useSetRecoilState(RoomCode);
  const userName = useRecoilValue(UserNameAtom);
  const inputRoomCode = useRecoilValue(InputRoomCodeAtom);

  const validateInputs = useCallback((checkRoomCode: boolean = false): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!validateUserName(userName)) {
      validationErrors.push({
        field: 'userName',
        message: 'Name must be 2-20 characters long and contain only letters, numbers, and spaces'
      });
    }

    if (checkRoomCode && !validateRoomCode(inputRoomCode)) {
      validationErrors.push({
        field: 'roomCode',
        message: 'Room code must be exactly 6 characters (letters and numbers only)'
      });
    }

    return validationErrors;
  }, [userName, inputRoomCode]);

  const createRoom = useCallback(async (): Promise<CreateRoomResult> => {
    if (isLoading) return { success: false, error: 'Already processing...' };
    
    setIsLoading(true);
    setErrors([]);

    try {
      const validationErrors = validateInputs(false);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return { success: false, error: validationErrors[0].message };
      }

      // Don't create a new room if one is already open
      if (roomOpen && roomCode) {
        return { success: true, roomCode };
      }

      const newRoomCode = randomStringGen();
      setRoomCode(newRoomCode);
      setRoomOpen(true);

      return { success: true, roomCode: newRoomCode };
    } catch (error) {
      console.error('Failed to create room:', error);
      const errorMessage = 'Failed to create room. Please try again.';
      setErrors([{ field: 'general', message: errorMessage }]);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, validateInputs, roomOpen, roomCode, setRoomCode, setRoomOpen]);

  const joinRoom = useCallback(async (): Promise<JoinRoomResult> => {
    if (isLoading) return { success: false, error: 'Already processing...' };

    setIsLoading(true);
    setErrors([]);

    try {
      const validationErrors = validateInputs(true);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return { success: false, error: validationErrors[0].message };
      }

      const sanitizedUserName = sanitizeInput(userName);
      const sanitizedRoomCode = inputRoomCode.trim().toUpperCase();
      const userId = generateUserId();

      // Navigate to chat room
      navigate('/chat', {
        state: {
          roomCode: sanitizedRoomCode,
          userName: sanitizedUserName,
          userId: userId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to join room:', error);
      const errorMessage = 'Failed to join room. Please try again.';
      setErrors([{ field: 'general', message: errorMessage }]);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, validateInputs, userName, inputRoomCode, navigate]);

  const navigateToRoom = useCallback((targetRoomCode?: string) => {
    if (isLoading) return;

    const codeToUse = targetRoomCode || roomCode;
    if (!codeToUse || !validateUserName(userName)) {
      setErrors([{ field: 'general', message: 'Missing required information' }]);
      return;
    }

    const sanitizedUserName = sanitizeInput(userName);
    const userId = generateUserId();

    navigate('/chat', {
      state: {
        roomCode: codeToUse,
        userName: sanitizedUserName,
        userId: userId,
      },
    });
  }, [isLoading, roomCode, userName, navigate]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrorByField = useCallback((field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  }, [errors]);

  return {
    createRoom,
    joinRoom,
    navigateToRoom,
    isLoading,
    errors,
    clearErrors,
    getErrorByField,
  };
};
