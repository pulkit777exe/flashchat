export type MessageType = "chat" | "join" | "typing_start" | "typing_stop" | "info" | "error";

export interface MessagePayload {
  type: MessageType;
  message?: string;
  roomId: string;
  personName: string;
  personId: string
}
