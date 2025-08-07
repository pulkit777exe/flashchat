import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { handleMessage, handleDisconnect } from "./controllers/userController";
import { log, error } from "./utils/logger";

dotenv.config();

// const PORT = Number(process.env.NODE_WEBSOCKET_PORT) || 8080;
// const HOST = process.env.NODE_BACKEND_URL || "localhost";
const PORT = 8080;
const HOST = "localhost";

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket: WebSocket) => {
  log("User connected");

  const context = {
    currentRoomId: null as string | null,
    currentPersonName: null as string | null,
    currentPersonId: null as string | null
  };

  // if (!context.currentRoomId || !context.currentPersonName || !context.currentPersonId) {
  //   console.log("Not found")
  //   process.exit(1);
  // }

  socket.on("message", (data) => handleMessage(socket, data, context));
  socket.on("close", () => handleDisconnect(socket, context.currentRoomId, context.currentPersonName, context.currentPersonId));
});

log(`WebSocket server running at ws://${HOST}:${PORT}`);
