import joinRoomHandler from "./joinRoomHandler";

export default function handleKeyDown (e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") {
    joinRoomHandler();
  }
};
