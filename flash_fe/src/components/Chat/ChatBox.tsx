import { ChatIcon } from "../../icons/ChatIcon";
import { CopyIcon } from "../../icons/CopyIcon";
import handleCopy from "../../handlers/handleCopy";
import handleKeyDown from "../../handlers/handleKeyDown"
import joinRoomHandler from "../../handlers/joinRoomHandler";
import { useRecoilValue } from "recoil";
import { UserNameAtom } from "../../store/atoms/UserNameAtom";
import createRoomCode from ""

export default function ChatBox() {
  const userName = useRecoilValue(UserNameAtom);

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
}
