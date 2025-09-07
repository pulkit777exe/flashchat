import { atom } from "recoil";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export const ConnectionStatusAtom = atom<ConnectionStatus>({
  key: "ConnectionStatus",
  default: "disconnected"
});
