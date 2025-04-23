import { useRef } from "react";
import { roomCode } from 

export const ContainerSection = () => {
    const inputRef = useRef("");
    
    function sendHandler() {
        const inputVal = inputRef.current.value;
        if (!inputVal) {
            return;
        }
        
    }

    function joinRoomHandler() {
        const roomId = 
    }

    return <div className="h-screen flex justify-center items-center p-2">
        <div className="flex flex-col items-end border border-white min-h-96 min-w-96 rounded-lg">
            <div className="text-xl flex-grow">
                Text-Content
            </div>
            <div className="w-full">
                <div>
                    <input ref={inputRef} type="text" placeholder="Type your message..." className="border w-full rounded-lg"/>
                </div>
                <div className="">
                    <button className="bg-linear-[135deg] from-white to-white/60 w-full rounded-lg" onClick={sendHandler}>
                        <div className="text-black font-semibold p-2">
                            SEND
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
} 