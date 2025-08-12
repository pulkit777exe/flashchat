export interface CreateRoomResult {
  success: boolean;
  roomCode?: string;
  error?: string;
}

export interface JoinRoomResult {
  success: boolean;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
