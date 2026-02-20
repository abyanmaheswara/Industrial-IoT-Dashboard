import { io } from "socket.io-client";

// Singleton socket instance
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
export const socket = io(API_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});
