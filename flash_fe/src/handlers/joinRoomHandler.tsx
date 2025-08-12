import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { InputRoomCodeAtom } from "../store/atoms/InputRoomCodeAtom";
import { UserNameAtom } from "../store/atoms/UserNameAtom";
import { randomStringGen } from "../utils/random";

export function JoinRoomHandler() {
  const navigate = useNavigate();
  const userName = useRecoilValue(UserNameAtom);
  const inputRoomCode = useRecoilValue(InputRoomCodeAtom);

  function joinRoom() {
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

  return <button onClick={joinRoom}>
    Join Room
  </button>
}
