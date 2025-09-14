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

// Store active file uploads
const activeFileUploads = new Map<string, {
  chunks: (string | undefined)[];
  totalChunks: number;
  fileData: any;
  roomId: string;
  personId: string;
  personName: string;
  timestamp: string;
}>();

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

    case "ping":
      // Respond to heartbeat
      socket.send(JSON.stringify({ type: "pong" }));
      break;

    // File handling cases
    case "file_message":
      handleFileMessage(socket, payload, context);
      break;

    case "file_start":
      handleFileStart(socket, payload, context);
      break;

    case "file_chunk":
      handleFileChunk(socket, payload, context);
      break;

    case "file_complete":
      handleFileComplete(socket, payload, context);
      break;

    default:
      warn(`Unknown message type: ${type}`);
      socket.send(JSON.stringify({ type: "error", message: "Unsupported message type" }));
  }
};

// File handling functions
const handleFileMessage = (socket: WebSocket, payload: any, context: Context): void => {
  if (!context.currentRoomId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Not joined to any room"
    }));
    return;
  }

  if (!allSockets[context.currentRoomId]) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Room not found"
    }));
    return;
  }

  log(`File message from ${payload.personName} in ${payload.roomId}: ${payload.fileData?.name}`);

  // Broadcast file message to all users in the room
  broadcast(context.currentRoomId, {
    type: "file_message",
    personId: payload.personId,
    personName: payload.personName,
    timestamp: payload.timestamp,
    roomId: payload.roomId,
    fileData: payload.fileData
  });
};

const handleFileStart = (socket: WebSocket, payload: any, context: Context): void => {
  if (!context.currentRoomId) {
    socket.send(JSON.stringify({
      type: "error",
      message: "Not joined to any room"
    }));
    return;
  }

  log(`File upload started: ${payload.fileId} from ${payload.personName} in ${payload.roomId}`);

  // Initialize chunked file upload
  activeFileUploads.set(payload.fileId, {
    chunks: new Array(payload.fileData.totalChunks),
    totalChunks: payload.fileData.totalChunks,
    fileData: payload.fileData,
    roomId: payload.roomId,
    personId: payload.personId,
    personName: payload.personName,
    timestamp: payload.timestamp
  });

  // Send progress update
  socket.send(JSON.stringify({
    type: "file_progress",
    fileId: payload.fileId,
    progress: 0
  }));
};

const handleFileChunk = (socket: WebSocket, payload: any, context: Context): void => {
  const upload = activeFileUploads.get(payload.fileId);
  if (!upload) {
    socket.send(JSON.stringify({
      type: "file_error",
      fileId: payload.fileId,
      message: "Upload session not found"
    }));
    return;
  }

  // Store the chunk
  upload.chunks[payload.chunkIndex] = payload.data;

  // Calculate progress
  const receivedChunks = upload.chunks.filter(chunk => chunk !== undefined).length;
  const progress = (receivedChunks / upload.totalChunks) * 100;

  // Send progress update
  socket.send(JSON.stringify({
    type: "file_progress",
    fileId: payload.fileId,
    progress: Math.round(progress)
  }));

  log(`File chunk ${payload.chunkIndex + 1}/${upload.totalChunks} received for ${payload.fileId}`);
};

const handleFileComplete = (socket: WebSocket, payload: any, context: Context): void => {
  const upload = activeFileUploads.get(payload.fileId);
  if (!upload) {
    socket.send(JSON.stringify({
      type: "file_error",
      fileId: payload.fileId,
      message: "Upload session not found"
    }));
    return;
  }

  try {
    // Check if all chunks are received
    const missingChunks = upload.chunks.findIndex(chunk => chunk === undefined);
    if (missingChunks !== -1) {
      throw new Error(`Missing chunk at index ${missingChunks}`);
    }

    // Combine all chunks
    const completeFile = upload.chunks.join('');

    log(`File upload completed: ${payload.fileId} from ${upload.personName} in ${upload.roomId}`);

    // Create the complete file message
    const fileMessage = {
      type: "file_message",
      personId: upload.personId,
      personName: upload.personName,
      timestamp: upload.timestamp,
      roomId: upload.roomId,
      fileData: {
        ...upload.fileData,
        data: completeFile,
        isBase64: true
      }
    };

    // Broadcast to all users in the room
    broadcast(upload.roomId, fileMessage);

    // Send completion confirmation
    socket.send(JSON.stringify({
      type: "file_complete",
      fileId: payload.fileId
    }));

    // Clean up
    activeFileUploads.delete(payload.fileId);

  } catch (error) {
    console.error("Error completing file upload:", error);
    socket.send(JSON.stringify({
      type: "file_error",
      fileId: payload.fileId,
      message: "Failed to complete file upload"
    }));
    activeFileUploads.delete(payload.fileId);
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

  // Clean up any active file uploads from this user
  activeFileUploads.forEach((upload, fileId) => {
    if (upload.personId === personId) {
      activeFileUploads.delete(fileId);
      log(`Cleaned up incomplete file upload ${fileId} from disconnected user ${personName}`);
    }
  });

  log(`${personName} disconnected from ${roomId}`);
};