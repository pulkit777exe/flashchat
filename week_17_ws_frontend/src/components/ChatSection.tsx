import { useState } from "react";
import { ChatIcon } from "../icons/ChatIcon"
import { randomStringGen } from "../utils/random"
import { CopyIcon } from "../icons/CopyIcon";
export const ChatSection = () => {
    const [roomOpen, setRoomOpen] = useState(false);
    const [roomCode, setRoomCode] = useState("");

    function createRoomCode() {
        if (!roomOpen) {
            const random = randomStringGen();
            setRoomOpen(true);
            setRoomCode(random);
            return random;
        } else {
            return "";
        }
    } 

    function joinRoom(roomId: String) {
        if (!roomId) {
            console.log("RoomId incorrect");
        }
    }

    const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(roomCode);
        } catch (err) {
          console.log('Failed to copy text.', err);
        }
    };

    return <div className="h-screen flex justify-center items-center">
        <div className="border border-gray-800 p-8 min-w-96 shadow-white rounded-xl">
            <div className="flex gap-1 text-2xl">
                <ChatIcon />    
                <div>
                    Chat App
                </div>
            </div>
            <div className="text-gray-400 text-md mt-2">
                this is a temorary room to chat with each other
            </div>
            <div className="">
                <div className="mt-4">
                    <button className="w-full text-black bg-white p-4 rounded-md font-bold font-stretch-120% hover:bg-white/90 cursor-pointer duration-300" onClick={createRoomCode}>Create New Room</button>
                </div>
            </div>
            <div className="flex flex-col mt-8">
                <input type="text" placeholder="Enter your name..." className="border border-gray-800 p-2" required/>
                <div className="flex flex-end mt-2">
                    <input type="text" placeholder="Enter room code..." className="border border-gray-800 p-2 flex-grow" required/>
                    <button className="text-black bg-white p-1 rounded-md font-bold hover:bg-white/90 cursor-pointer duration-300">Join Room</button>
                </div>
            </div>
            {roomOpen ? 
            <div className="flex flex-col bg-gray-900 mt-8 p-2 rounded-xl">
                <div>
                    This is the code, please copy it and give it to the reciever
                </div>
                <div className="text-4xl text-white text-center"> 
                    {roomCode} <button onClick={handleCopy} className="cursor-pointer">{<CopyIcon />}</button>
                </div>
            </div> : <div className="hidden">

            </div>}
        </div>

    </div>
}