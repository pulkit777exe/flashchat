import { useRecoilValue } from "recoil";
import { InputRoomCodeAtom } from "../store/atoms/InputRoomCodeAtom";
import { UserNameAtom } from "../store/atoms/UserNameAtom";
import { randomStringGen } from "../utils/random";

export default function joinRoomHandler() {
  const userName = useRecoilValue(UserNameAtom);
  const inputRoomCode = useRecoilValue(InputRoomCodeAtom);
  if (!userName || !inputRoomCode) {
    alert("Please enter your name and room code.");
    return;
  }
  const randomId = randomStringGen();
  navigate("/chat", {
    state: {
      roomCode: inputRoomCode,
      userName: userName,
      userId: userName + randomId,
    },
  });
}
