import { atom } from "recoil";
import { ChatMessage } from "../../types/chat";

export const MessagesAtom = atom<ChatMessage[]>({
  key: "Messages",
  default: []
});
