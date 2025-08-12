export const validateRoomCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
};

export const validateUserName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 20 && /^[a-zA-Z0-9\s]+$/.test(trimmedName);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};

export const generateRoomCode = (): string => {
    
}