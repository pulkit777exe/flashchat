"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
console.log("WebSocket Server running on ws://localhost:8080");
const allSockets = {};
wss.on("connection", (socket) => {
    console.log("User connected");
    socket.on("message", (data) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(data.toString());
            const { type, message, roomId, personName } = parsedMessage;
            if (type === "join") {
                if (!allSockets[roomId]) {
                    allSockets[roomId] = [];
                }
                allSockets[roomId].push(socket);
                console.log(`User ${personName} joined room ${roomId}`);
                socket.send(JSON.stringify({
                    type: "info",
                    message: `You joined room ${roomId}`,
                }));
            }
            if (type === "chat" && message && allSockets[roomId]) {
                console.log(`Message from ${personName} to room ${roomId}: ${message}`);
                for (const client of allSockets[roomId]) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "chat",
                            message,
                            roomId,
                            personName
                        }));
                    }
                }
            }
        }
        catch (e) {
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
