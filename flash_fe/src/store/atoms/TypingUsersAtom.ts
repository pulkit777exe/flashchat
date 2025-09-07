import { atom } from "recoil";
import { TypingIndicator } from "../../types/chat";

export const TypingUsersAtom = atom<TypingIndicator[]>({
  key: "TypingUsers",
  default: []
});
