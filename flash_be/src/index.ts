import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { handleMessage, handleDisconnect } from "./controllers/userController";
import { log } from "./utils/logger";

dotenv.config();

const PORT = Number(process.env.NODE_WEBSOCKET_PORT) || 8080;
const HOST = process.env.NODE_BACKEND_URL || "localhost";

console.log(`Server starting on: ${HOST}:${PORT}`);

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket: WebSocket) => {
  log("User connected");

  const context = {
    currentRoomId: null as string | null,
    currentPersonName: null as string | null,
    currentPersonId: null as string | null,
  };

  socket.on("message", (data) => handleMessage(socket, data, context));
  socket.on("close", () =>
    handleDisconnect(
      socket,
      context.currentRoomId,
      context.currentPersonName,
      context.currentPersonId
    )
  );
});

wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

log(`WebSocket server running at ${HOST}:${PORT}`);
