import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface ChatMessage {
  personName: string;
  message: string;
  type: "chat" | "info" | "error";
}

export const ContainerSection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const location = useLocation();
  const { roomCode, userName } = location.state || {};

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to server");
      ws.send(
        JSON.stringify({
          type: "join",
          roomId: roomCode,
          personName: userName,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat" || data.type === "info") {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    setSocket(ws);

    return () => ws.close();
  }, [roomCode, userName]);

  const sendHandler = () => {
    const value = inputRef.current?.value;
    if (!value || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        message: value,
        roomId: roomCode,
        personName: userName,
      })
    );
    inputRef.current.value = "";
  };

  return (
    <div className="h-screen flex justify-center items-center bg-black text-white">
      <div className="flex flex-col border border-gray-800 min-h-[600px] w-[500px] rounded-lg p-4 bg-black">
        <div className="flex-grow overflow-y-auto mb-4 space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-2 rounded ${msg.type === "chat" ? "bg-gray-800" : "text-gray-400"}`}>
              {msg.type === "chat" && (
                <span><strong>{msg.personName}:</strong> {msg.message}</span>
              )}
              {msg.type === "info" && (
                <span className="italic">{msg.message}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-grow p-2 rounded-l bg-gray-800 text-white"
          />
          <button onClick={sendHandler} className="bg-white hover:bg-white/90 duration-300 text-black px-4 rounded-r font-bold">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
