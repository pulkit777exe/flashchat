import WebSocket from "ws";

// Active sockets by room
export const allSockets: Record<string, WebSocket[]> = {};

// Typing users per room
export const typingUsers: Record<string, Record<string, boolean>> = {};
