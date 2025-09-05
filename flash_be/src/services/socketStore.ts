import WebSocket from "ws";

export const allSockets: Record<string, WebSocket[]> = {};

export const typingUsers: Record<string, Record<string, boolean>> = {};
