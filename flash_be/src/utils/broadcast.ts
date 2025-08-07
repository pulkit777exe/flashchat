import { WebSocket } from "ws";
import { allSockets } from "../services/socketStore";

export const broadcast = (
  roomId: string,
  data: object,
  excludeSocket?: WebSocket
): void => {
  const clients = allSockets[roomId] || [];
  const payload = JSON.stringify(data);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeSocket) {
      client.send(payload);
    }
  });
};
