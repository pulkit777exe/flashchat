// Enhanced chat types to support file messages

export interface BaseMessage {
  id: string;
  personName: string;
  personId: string;
  timestamp: number;
  roomId?: string;
}

export interface TextMessage extends BaseMessage {
  type: "chat" | "info";
  message: string;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  data?: string; 
  url?: string;
  thumbnailUrl?: string;
  isBase64?: boolean;
}

export interface FileMessage extends BaseMessage {
  type: "file";
  fileData: FileData;
}

export type ChatMessage = TextMessage | FileMessage;

// WebSocket message types
export interface BaseWebSocketMessage {
  type: string;
  personName?: string;
  personId?: string;
  roomId?: string;
  timestamp?: number;
  message?: string;
}

export interface ChatWebSocketMessage extends BaseWebSocketMessage {
  type: "chat" | "info";
  message: string;
}

export interface FileWebSocketMessage extends BaseWebSocketMessage {
  type: "file_message";
  fileData: FileData;
}

export interface FileStartMessage extends BaseWebSocketMessage {
  type: "file_start";
  fileId: string;
  fileData: {
    name: string;
    type: string;
    size: number;
    totalChunks: number;
  };
}

export interface FileChunkMessage extends BaseWebSocketMessage {
  type: "file_chunk";
  fileId: string;
  chunkIndex: number;
  data: string; 
}

export interface FileCompleteMessage extends BaseWebSocketMessage {
  type: "file_complete";
  fileId: string;
}

export interface FileProgressMessage extends BaseWebSocketMessage {
  type: "file_progress";
  fileId: string;
  progress: number;
}

export interface FileErrorMessage extends BaseWebSocketMessage {
  type: "file_error";
  fileId: string;
  message: string;
}

export interface TypingStartMessage extends BaseWebSocketMessage {
  type: "typing_start";
}

export interface TypingStopMessage extends BaseWebSocketMessage {
  type: "typing_stop";
}

export interface JoinMessage extends BaseWebSocketMessage {
  type: "join";
}

export interface PingMessage extends BaseWebSocketMessage {
  type: "ping";
}

export interface PongMessage extends BaseWebSocketMessage {
  type: "pong";
}

export interface ErrorMessage extends BaseWebSocketMessage {
  type: "error";
  message: string;
}

export type WebSocketMessage = 
  | ChatWebSocketMessage
  | FileWebSocketMessage
  | FileStartMessage
  | FileChunkMessage
  | FileCompleteMessage
  | FileProgressMessage
  | FileErrorMessage
  | TypingStartMessage
  | TypingStopMessage
  | JoinMessage
  | PingMessage
  | PongMessage
  | ErrorMessage;

// File upload related types
export interface FileUploadState {
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
}

export interface FileUploadProgress {
  fileId: string;
  progress: number;
  file: File;
}

// Typing indicator types
export interface TypingUser {
  personId: string;
  personName: string;
  timestamp: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const isTextMessage = (message: ChatMessage): message is TextMessage => {
  return message.type === "chat" || message.type === "info";
};

export const isFileMessage = (message: ChatMessage): message is FileMessage => {
  return message.type === "file";
};

export const isImageFile = (fileData: FileData): boolean => {
  return fileData.type.startsWith('image/');
};

export const isVideoFile = (fileData: FileData): boolean => {
  return fileData.type.startsWith('video/');
};

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; 
export const MAX_SMALL_FILE_SIZE = 1024 * 1024; 

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Please select an image or video.' };
  }
  
  return { valid: true };
};