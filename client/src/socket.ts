import { io } from 'socket.io-client';

// Singleton socket instance
export const socket = io('http://localhost:3001', {
  autoConnect: false, // We will connect manually when authenticated
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket'] // Force websocket to avoid polling 400 errors
});
