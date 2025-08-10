export interface ChatMessage {
  personId: string;
  personName: string;
  message: string;
  type: "chat" | "info" | "error";
}

export interface TypingIndicator {
  personName: string;
  timestamp: number;
}
