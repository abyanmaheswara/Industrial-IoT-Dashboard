import { io } from "socket.io-client";
import { API_URL } from "./config";

// Singleton socket instance
export const socket = io(API_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket"],
});
