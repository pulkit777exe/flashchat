
export type MessageType = "chat" | "join" | "typing_start" | "typing_stop" | "info" | "error" | "file_message" | "file_start" | "file_chunk" | "file_complete" | "file_progress" | "file_error";

export interface MessagePayload {
  type: string;
  message?: string;
  roomId: string;
  personName: string;
  personId: string;
  timestamp?: string;
  
  fileId?: string;
  fileData?: {
    name: string;
    type: string;
    size: number;
    data?: string;
    isBase64?: boolean;
    totalChunks?: number;
  };
  chunkIndex?: number;
  data?: string;
  progress?: number;
}

export interface FileMessagePayload extends MessagePayload {
  type: 'file_message';
  fileData: {
    name: string;
    type: string;
    size: number;
    data: string;
    isBase64: true;
  };
}

export interface FileStartPayload extends MessagePayload {
  type: 'file_start';
  fileId: string;
  fileData: {
    name: string;
    type: string;
    size: number;
    totalChunks: number;
  };
}

export interface FileChunkPayload extends MessagePayload {
  type: 'file_chunk';
  fileId: string;
  chunkIndex: number;
  data: string;
}

export interface FileCompletePayload extends MessagePayload {
  type: 'file_complete';
  fileId: string;
}