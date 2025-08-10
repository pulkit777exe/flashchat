import { useRecoilValue } from "recoil";
import { RoomCode } from "../store/atoms/RoomCodeAtom";

export default async function handleCopy() {
  const roomCode = useRecoilValue(RoomCode);
  try {
    await navigator.clipboard.writeText(roomCode);
  } catch (err) {
    console.log("Failed to copy text.", err);
  }
}
