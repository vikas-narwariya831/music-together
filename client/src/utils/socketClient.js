import './versionManager';
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
 * Ensure persistent device/user identity in localStorage BEFORE socket connects
 */
export function getOrCreateUserId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('musictogether_uid');
  if (!id) {
    id = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('musictogether_uid', id);
  }
  return id;
}

export function getStoredUsername() {
  if (typeof window === 'undefined') return 'Vikas';
  return localStorage.getItem('musictogether_user') || 'Vikas';
}

// Pre-fetch identity before establishing socket connection
const initialUserId = getOrCreateUserId();
const initialUsername = getStoredUsername();

/**
 * Global Singleton Socket Instance
 * Automatically sends userId and username in the handshake `auth` & `query`,
 * uses WebSocket transport first to eliminate "Session ID unknown" polling errors,
 * and recovers gracefully.
 */
export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'], // WebSocket first avoids stale HTTP polling session ID errors
  upgrade: true,
  auth: {
    userId: initialUserId,
    username: initialUsername
  },
  query: {
    userId: initialUserId,
    username: initialUsername
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  randomizationFactor: 0.3,
  timeout: 15000,
  autoConnect: true
});

socket.on('connect', () => {
  console.log(`⚡ [Global Socket] Connected successfully! ID: ${socket.id} (User: ${getStoredUsername()}, UID: ${getOrCreateUserId()}) to ${BACKEND_URL}`);
});

socket.on('connect_error', (err) => {
  console.warn('⚠️ [Global Socket] Connect error:', err.message);

  // If "Session ID unknown" happens due to server restart or serverless container change:
  // Update auth credentials and trigger immediate fresh connection
  if (err.message && (err.message.includes('Session ID unknown') || err.message.includes('code":1'))) {
    console.log('🔄 Session ID expired/unknown. Refreshing handshake credentials and reconnecting...');
    socket.auth = {
      userId: getOrCreateUserId(),
      username: getStoredUsername()
    };
    socket.connect();
  }
});

socket.on('disconnect', (reason) => {
  console.warn('🔌 [Global Socket] Disconnected:', reason);
  // Re-sync auth with latest localStorage data before reconnecting
  socket.auth = {
    userId: getOrCreateUserId(),
    username: getStoredUsername()
  };
  if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
    socket.connect();
  }
});

export default socket;
