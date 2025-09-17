export interface BaseMessage {
  id: string;
  personName: string;
  personId: string;
  timestamp: number;
  roomId?: string;
}

export interface TextMessage extends BaseMessage {
  type: "chat" | "info" | "system" | "error";
  message: string;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; 
  isBase64: boolean;
  url?: string; // Optional URL for file access
}

export interface FileMessage extends BaseMessage {
  type: "file";
  fileData: FileData;
  message: string; // Make required to align with ChatMessage type
}

export interface ChatMessage extends BaseMessage {
  type: 'chat' | 'info' | 'system' | 'error' | 'file';
  message: string;
  
  // File-related properties (optional, only present for file messages)
  fileData?: FileData;
}

export interface BaseWebSocketMessage {
  type: string;
  personName?: string;
  personId?: string;
  roomId?: string;
  timestamp?: number;
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

export interface TypingUser {
  personId: string;
  personName: string;
  timestamp: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export const isTextMessage = (message: ChatMessage): message is TextMessage => {
  return message.type === "chat" || message.type === "info" || message.type === "system" || message.type === "error";
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

export const isAudioFile = (fileData: FileData): boolean => {
  return fileData.type.startsWith('audio/');
};

export const isDocumentFile = (fileData: FileData): boolean => {
  return fileData.type.startsWith('application/') || fileData.type.startsWith('text/');
};

export const isArchiveFile = (fileData: FileData): boolean => {
  return fileData.type.includes('zip') || fileData.type.includes('rar') || fileData.type.includes('tar');
};

export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png', 
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/mkv',
  
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/m4a',
  
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'text/csv',
  'application/rtf',
  'application/vnd.oasis.opendocument.text', // .odt
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
  'application/vnd.oasis.opendocument.presentation', // .odp
  
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-7z-compressed',
  
  // Code files
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'text/xml',
  'application/xml',
  'text/markdown',
  
  // Other common types
  'application/octet-stream'
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for general files
export const MAX_SMALL_FILE_SIZE = 1024 * 1024; // 1MB for thumbnails/previews
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB for documents 

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check if file type is allowed
  if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Please select a supported file format.' };
  }
  
  // Size validation based on file type
  if (isVideoFile({ type: file.type, name: file.name, size: file.size, data: '', isBase64: false })) {
    if (file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: 'Video file too large. Maximum size is 100MB.' };
    }
  } else if (isDocumentFile({ type: file.type, name: file.name, size: file.size, data: '', isBase64: false })) {
    if (file.size > MAX_DOCUMENT_SIZE) {
      return { valid: false, error: 'Document file too large. Maximum size is 25MB.' };
    }
  } else if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 50MB.' };
  }
  
  return { valid: true };
};