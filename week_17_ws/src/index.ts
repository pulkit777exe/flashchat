import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server running on ws://localhost:8080");

const allSockets: { [roomId: string]: WebSocket[] } = {};

/*
{
  "roomId": ["user1", "user2", ...]
  "roomId1": ["user1", "user2", ...]
  "roomId2": ["user1", "user2", ...]
  }
  
  */
 
 /*
 {
  "message" : "this is a message"
  "type" : "chat" | "join"
  "roomId" : Number
  "personName" : String
  }
  
  */
 
 type MessageType = "chat" | "join";

interface MessagePayload {
  type: MessageType;
  message?: string;
  roomId: string;
  personName: string;
}

wss.on("connection", (socket: WebSocket) => {
  console.log("User connected");

  socket.on("message", (data) => {
    let parsedMessage:MessagePayload;

    try {
      parsedMessage = JSON.parse(data.toString());

      const { type, message, roomId, personName } = parsedMessage;

      if (type === "join") {
        if (!allSockets[roomId]) {
          allSockets[roomId] = [];
        }
        allSockets[roomId].push(socket);
        console.log(`User ${personName} joined room ${roomId}`);

        socket.send(
          JSON.stringify({
            type: "info",
            message: `You joined room ${roomId}`,
          })
        );
      }

      if (type === "chat" && message && allSockets[roomId]) {
        console.log(`Message from ${personName} to room ${roomId}: ${message}`);

        for (const client of allSockets[roomId]) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "chat",
                message,
                roomId,
                personName
              })
            );
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse message", e);
      socket.send(JSON.stringify({ type: "error", message: "Invalid format" }));
    }
  });

  socket.on("close", () => {
    console.log("User disconnected");

    for (const roomId in allSockets) {
      allSockets[roomId] = allSockets[roomId].filter((s) => s !== socket);
      if (allSockets[roomId].length === 0) {
        delete allSockets[roomId];
      }
    }
  });
});
