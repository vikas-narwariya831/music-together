import { io } from 'socket.io-client';

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.')
);

export const BACKEND_URL = isLocal 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_SOCKET_URL || 'https://server-chi-liard.vercel.app');

/**
 * Global Singleton Socket Instance
 * Automatically connects immediately when the app starts, persists throughout page lifetime,
 * and handles reconnection seamlessly across mobile/desktop.
 */
export const socket = io(BACKEND_URL, {
  transports: ['polling', 'websocket'], // Polling first for 100% instant handshake on Vercel/proxies, then auto-upgrades to websocket
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  randomizationFactor: 0.3,
  timeout: 15000,
  autoConnect: true
});

socket.on('connect', () => {
  console.log(`⚡ [Global Socket] Connected successfully! ID: ${socket.id} to ${BACKEND_URL}`);
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ [Global Socket] Connect error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.warn('🔌 [Global Socket] Disconnected:', reason);
  if (reason === 'io server disconnect' || reason === 'transport close') {
    socket.connect();
  }
});

export default socket;
