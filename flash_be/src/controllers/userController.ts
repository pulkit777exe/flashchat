import WebSocket from "ws";
import { MessagePayload } from "../types/messageTypes";
import { allSockets, typingUsers } from "../services/socketStore";
import { log, error, warn } from "../utils/logger";
import { broadcast } from "../utils/broadcast";

interface Context {
  currentRoomId: string | null;
  currentPersonName: string | null;
  currentPersonId: string | null;
}

export const handleMessage = (
  socket: WebSocket,
  data: WebSocket.RawData,
  context: Context
): void => {
  let payload: MessagePayload;

  try {
    payload = JSON.parse(data.toString());
  } catch (err) {
    error("Invalid JSON:", err);
    socket.send(JSON.stringify({ type: "error", message: "Invalid JSON format" }));
    return;
  }

  const { type, message, roomId, personName, personId } = payload;

  switch (type) {
    case "join":
      // Check if socket is already in the room to avoid duplicate join
      if (context.currentRoomId === roomId && context.currentPersonId === personId) {
        warn(`${personName} tried to join ${roomId} twice`);
        socket.send(JSON.stringify({ type: "error", message: "Already joined this room" }));
        return;
      }

      context.currentRoomId = roomId;
      context.currentPersonName = personName;
      context.currentPersonId = personId;

      if (!allSockets[roomId]) allSockets[roomId] = [];
      if (!allSockets[roomId].includes(socket)) {
        allSockets[roomId].push(socket);

        log(`${personName} joined ${roomId}`);

        socket.send(JSON.stringify({ type: "info", message: `You joined ${roomId}` }));

        broadcast(roomId, {
          type: "info",
          message: `${personName} has joined the room.`,
        }, socket);
      }
      break;

    case "chat":
      if (!message || !allSockets[roomId]) return;

      log(`Chat from ${personName} in ${roomId}: ${message}`);

      // Remove from typing users if typing
      if (typingUsers[roomId]?.[personId]) {
        delete typingUsers[roomId][personId];
        broadcast(roomId, { type: "typing_stop", roomId, personName, personId }, socket);
      }

      broadcast(roomId, { type: "chat", message, roomId, personName, personId });
      break;

    case "typing_start":
      typingUsers[roomId] ||= {};
      typingUsers[roomId][personId] = true;

      log(`${personName} started typing in ${roomId}`);
      broadcast(roomId, { type: "typing_start", roomId, personName, personId }, socket);
      break;

    case "typing_stop":
      if (typingUsers[roomId]?.[personId]) {
        delete typingUsers[roomId][personId];
        log(`${personName} stopped typing in ${roomId}`);
        broadcast(roomId, { type: "typing_stop", roomId, personName, personId }, socket);
      }
      break;

    default:
      warn(`Unknown message type: ${type}`);
      socket.send(JSON.stringify({ type: "error", message: "Unsupported message type" }));
  }
};

export const handleDisconnect = (
  socket: WebSocket,
  roomId: string | null,
  personName: string | null,
  personId: string | null
): void => {
  if (!roomId || !personName || !personId) return;

  // Remove socket from room
  allSockets[roomId] = allSockets[roomId]?.filter((s) => s !== socket) || [];

  // Cleanup empty rooms
  if (allSockets[roomId].length === 0) delete allSockets[roomId];

  // Handle typing status
  if (typingUsers[roomId]?.[personId]) {
    delete typingUsers[roomId][personId];
    broadcast(roomId, { type: "typing_stop", roomId, personName, personId }, socket);
  }

  log(`${personName} disconnected from ${roomId}`);
};
