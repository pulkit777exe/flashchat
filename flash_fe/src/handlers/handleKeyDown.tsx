import { JoinRoomHandler } from "./joinRoomHandler";

export default function handleKeyDown (e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") {
    JoinRoomHandler();
  }
};
