import { atom } from "recoil";

export const WebSocketAtom = atom<WebSocket | null>({
  key: "WebSocket",
  default: null,
  dangerouslyAllowMutability: true
});
