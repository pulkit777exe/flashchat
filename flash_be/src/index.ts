import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { handleMessage, handleDisconnect } from "./controllers/userController";
import { log } from "./utils/logger";

dotenv.config();

const PORT = Number(process.env.NODE_WEBSOCKET_PORT);
const HOST = process.env.NODE_BACKEND_URL;

// const HOST = "localhost";
console.log(HOST);
console.log(PORT);

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

log(`WebSocket server running at ws://${HOST}:${PORT}`);
