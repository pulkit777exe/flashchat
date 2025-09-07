// store/atoms/TypingUsersAtom.ts
import { atom } from 'recoil';
import { TypingUser } from '../../types/chat'; // Fixed: Use TypingUser instead of TypingIndicator

export const TypingUsersAtom = atom<TypingUser[]>({
  key: 'TypingUsersAtom',
  default: [],
});