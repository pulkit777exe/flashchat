import { useSetRecoilState } from "recoil";
import { RoomOpenAtom } from "../store/atoms/RoomOpenAtom";
import { randomStringGen } from "../utils/random"
import { RoomCode } from "../store/atoms/RoomCodeAtom";

export default function createRoomCode() {
  
  const roomOpen = useRecoilValue(RoomOpenAtom);
  const setRoomOpen = useSetRecoilState(RoomOpenAtom);
  const setRoomCode = useSetRecoilState(RoomCode);

  if (!roomOpen) {
    const random = randomStringGen();
    setRoomOpen(true);
    setRoomCode(random);
    return random;
  }
  return "";
}
