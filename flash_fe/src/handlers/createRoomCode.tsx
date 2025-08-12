import { useRecoilValue, useSetRecoilState } from "recoil";
import { RoomOpenAtom } from "../store/atoms/RoomOpenAtom";
import { randomStringGen } from "../utils/random";
import { RoomCode } from "../store/atoms/RoomCodeAtom";

export function CreateRoomCodeButton() {
  const roomOpen = useRecoilValue(RoomOpenAtom);
  const setRoomOpen = useSetRecoilState(RoomOpenAtom);
  const setRoomCode = useSetRecoilState(RoomCode);

  const createRoomCodeHandler = () => {
    if (!roomOpen) {
      const random = randomStringGen();
      setRoomOpen(true);
      setRoomCode(random);
      return random;
    }
    return "";
  };

  return (
    <button onClick={createRoomCodeHandler}>
      Create New Room
    </button>
  );
}
