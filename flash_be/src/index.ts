import { WebSocketServer, WebSocket } from "ws";
const PORT = process.env.WEBSOCKET_PORT || 8080;
const wss = new WebSocketServer({ port: Number(PORT) });
console.log(`WebSocket Server running on ws://${process.env.BACKEND_URL}:${process.env.WEBSOCKET_PORT || 8080}`);

// Stores active WebSockets per room
const allSockets: { [roomId: string]: WebSocket[] } = {};

// Stores typing users per room
// Example: {
//    "room1": {
//      "userA": true, 
//      "userB": true 
//    }, 
//    "room2": {
//      "userC": true 
//    } 
// }

const typingUsersPerRoom: {
  [roomId: string]: { [personName: string]: boolean };
} = {};

type MessageType = "chat" | "join" | "typing_start" | "typing_stop";

interface MessagePayload {
  type: MessageType;
  message?: string;
  roomId: string;
  personName: string;
}

wss.on("connection", (socket: WebSocket) => {
  console.log("User connected");

  // Store the room and personName associated with this socket
  // This helps when a user disconnects, so we know which room/typing status to clean up
  let currentRoomId: string | null = null;
  let currentPersonName: string | null = null;

  socket.on("message", (data) => {
    let parsedMessage: MessagePayload;

    try {
      parsedMessage = JSON.parse(data.toString());

      const { type, message, roomId, personName } = parsedMessage;

      // Update current socket's room and name on join
      if (type === "join") {
        currentRoomId = roomId;
        currentPersonName = personName;

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
        // Inform others in the room that a new user joined
        for (const client of allSockets[roomId]) {
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "info",
                message: `${personName} has joined the room.`,
              })
            );
          }
        }
      }

      // Handle chat messages
      else if (type === "chat" && message && allSockets[roomId]) {
        console.log(`Message from ${personName} to room ${roomId}: ${message}`);

        // Also, when a user sends a chat message, they are no longer typing
        if (
          typingUsersPerRoom[roomId] &&
          typingUsersPerRoom[roomId][personName]
        ) {
          delete typingUsersPerRoom[roomId][personName];
          // Broadcast the typing_stop to others in the room
          for (const client of allSockets[roomId]) {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "typing_stop",
                  roomId,
                  personName,
                })
              );
            }
          }
        }

        // Broadcast the chat message to all clients in the room
        for (const client of allSockets[roomId]) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "chat",
                message,
                roomId,
                personName,
              })
            );
          }
        }
      }

      // Handle typing_start events
      else if (type === "typing_start" && allSockets[roomId]) {
        if (!typingUsersPerRoom[roomId]) {
          typingUsersPerRoom[roomId] = {};
        }
        // Mark user as typing
        typingUsersPerRoom[roomId][personName] = true;
        console.log(`${personName} started typing in room ${roomId}`);

        // Broadcast to all other clients in the room
        for (const client of allSockets[roomId]) {
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            // Don't send back to sender
            client.send(
              JSON.stringify({
                type: "typing_start",
                roomId,
                personName,
              })
            );
          }
        }
      }

      // Handle typing_stop events
      else if (type === "typing_stop" && allSockets[roomId]) {
        if (
          typingUsersPerRoom[roomId] &&
          typingUsersPerRoom[roomId][personName]
        ) {
          // Unmark user as typing
          delete typingUsersPerRoom[roomId][personName];
          console.log(`${personName} stopped typing in room ${roomId}`);

          // Broadcast to all other clients in the room
          for (const client of allSockets[roomId]) {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
              // Don't send back to sender
              client.send(
                JSON.stringify({
                  type: "typing_stop",
                  roomId,
                  personName,
                })
              );
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse message or handle event:", e);
      socket.send(
        JSON.stringify({ type: "error", message: "Invalid message format" })
      );
    }
  });

  socket.on("close", () => {
    console.log("User disconnected");

    // Clean up allSockets entry
    if (currentRoomId && allSockets[currentRoomId]) {
      allSockets[currentRoomId] = allSockets[currentRoomId].filter(
        (s) => s !== socket
      );
      if (allSockets[currentRoomId].length === 0) {
        delete allSockets[currentRoomId];
      }
    }

    // Clean up typing status and broadcast to others
    if (
      currentRoomId &&
      currentPersonName &&
      typingUsersPerRoom[currentRoomId] &&
      typingUsersPerRoom[currentRoomId][currentPersonName]
    ) {
      delete typingUsersPerRoom[currentRoomId][currentPersonName];
      console.log(
        `${currentPersonName} disconnected and stopped typing in room ${currentRoomId}`
      );

      // Broadcast typing_stop if this user was typing
      if (allSockets[currentRoomId]) {
        // Check if room still exists after socket cleanup
        for (const client of allSockets[currentRoomId]) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "typing_stop",
                roomId: currentRoomId,
                personName: currentPersonName,
              })
            );
          }
        }
      }
    }
  });
});
