import { io } from 'socket.io-client';

// Singleton socket instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const socket = io(API_URL, {
  autoConnect: false, // We will connect manually when authenticated
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket'] // Force websocket to avoid polling 400 errors
});
