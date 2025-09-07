// store/atoms.ts
import { atom } from 'recoil';
import { ChatMessage, TypingUser, ConnectionStatus } from '../../types/chat';

// WebSocket connection atom
export const WebSocketAtom = atom<WebSocket | null>({
  key: 'WebSocketAtom',
  default: null,
});

// Messages atom
export const MessagesAtom = atom<ChatMessage[]>({
  key: 'MessagesAtom',
  default: [],
});

// Typing users atom
export const TypingUsersAtom = atom<TypingUser[]>({
  key: 'TypingUsersAtom',
  default: [],
});

// Connection status atom
export const ConnectionStatusAtom = atom<ConnectionStatus>({
  key: 'ConnectionStatusAtom',
  default: 'disconnected',
});