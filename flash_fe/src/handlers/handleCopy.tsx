import { useRecoilValue } from "recoil";
import { RoomCode } from "../store/atoms/RoomCodeAtom";
import { CopyIcon } from "../icons/CopyIcon";

export function HandleCopy() {
  
  const roomCode = useRecoilValue(RoomCode);
  
  async function handleCopy () {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch (err) {
      console.log("Failed to copy text.", err);
    }
  } 

  return <div onClick={handleCopy}>
    <CopyIcon />
  </div>
}
