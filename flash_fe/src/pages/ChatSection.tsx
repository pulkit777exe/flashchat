import { ChatIcon } from "../icons/ChatIcon";
import { randomStringGen } from "../utils/random";
import { CopyIcon } from "../icons/CopyIcon";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { RoomOpenAtom } from "../store/atoms/RoomOpenAtom";
import { UserNameAtom } from "../store/atoms/UserNameAtom";
import { InputRoomCodeAtom } from "../store/atoms/InputRoomCodeAtom";
import { RoomCode } from "../store/atoms/RoomCodeAtom";

export const ChatSection = () => {

    const roomOpen = useRecoilValue(RoomOpenAtom);
    const setRoomOpen = useSetRecoilState(RoomOpenAtom);
    const userName = useRecoilValue(UserNameAtom);
    const setUserName = useSetRecoilState(UserNameAtom);
    const roomCode = useRecoilValue(RoomCode);
    const setRoomCode = useSetRecoilState(RoomCode);
    const inputRoomCode = useRecoilValue(InputRoomCodeAtom);
    const setInputRoomCode = useSetRecoilState(InputRoomCodeAtom);

    const navigate = useNavigate();

    function createRoomCode() {
        if (!roomOpen) {
            const random = randomStringGen();
            setRoomOpen(true);
            setRoomCode(random);
            return random;
        }
        return "";
    }

    function joinRoomHandler() {
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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
        } catch (err) {
            console.log("Failed to copy text.", err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      joinRoomHandler();
    }
  };


    return (
        <div className="h-screen flex justify-center items-center bg-black text-white px-4">
            <div className="border border-gray-800 p-8 min-w-[360px] shadow-white rounded-xl w-full max-w-md">
                <div className="flex items-center gap-2 text-2xl font-semibold">
                    <ChatIcon />
                    <span>Chat App</span>
                </div>

                <p className="text-gray-400 text-sm mt-2">
                    A temporary room to chat with each other.
                </p>

                <div className="mt-6">
                    <button
                        className="w-full text-black bg-white p-3 rounded-md font-bold hover:bg-white/90 transition"
                        onClick={createRoomCode}
                    >
                        Create New Room
                    </button>
                </div>

                <div className="mt-8 space-y-3">
                    <input
                        type="text"
                        placeholder="Enter your name..."
                        className="w-full border border-gray-800 p-2 rounded text-white"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter room code..."
                            className="border border-gray-800 p-2 flex-grow rounded text-white"
                            value={inputRoomCode}
                            onChange={(e) => setInputRoomCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            required
                        />
                        <button
                            className="text-black bg-white px-4 rounded-md font-bold hover:bg-white/90 transition"
                            onClick={joinRoomHandler}
                        >
                            Join
                        </button>
                    </div>
                </div>

                {roomOpen && (
                    <div className="bg-gray-800 mt-8 p-4 rounded-xl">
                        <p className="text-sm text-gray-300">
                            This is your room code. Share it with others to let them join:
                        </p>
                        <div className="text-2xl text-white mt-2 flex items-center justify-between">
                            <span>{roomCode}</span>
                            <button onClick={handleCopy} className="ml-2 hover:text-gray-300">
                                <CopyIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
