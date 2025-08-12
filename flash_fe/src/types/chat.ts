export interface ChatMessage {
  id: string;
  type: 'chat' | 'info';
  message: string;
  personName: string;
  personId: string;
  timestamp: number;
  roomId?: string;
}

export interface TypingIndicator {
  personId: string;
  personName: string;
  timestamp: number;
}

// Add the missing WebSocketMessage interface
export interface WebSocketMessage {
  type: 'join' | 'chat' | 'info' | 'typing_start' | 'typing_stop';
  roomId?: string;
  personName?: string;
  personId?: string;
  message?: string;
  timestamp?: number;
  userName?: string; // For backward compatibility
}

// Browser environment timeout type
export type TimeoutId = ReturnType<typeof setTimeout>;
