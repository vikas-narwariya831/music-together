require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const roomRoutes = require('./routes/roomRoutes');
const { registerSocketHandlers } = require('./sockets/musicSocket');

// ── Constants ────────────────────────────────────────────────────────────────
const PORT            = process.env.PORT || 5000;
const PING_TIMEOUT    = 20000;
const PING_INTERVAL   = 10000;
const MAX_ROOM_SIZE   = 20; // max users per room

// Allowed origins — add your Vercel URL here (or use * only in dev)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'https://music-together-liard.vercel.app'];

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // prevent large payload attacks

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute window
  max: 20,              // max 20 search requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many search requests. Please wait a moment.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// Apply limiters
app.use('/api/search', searchLimiter);
app.use('/api', apiLimiter);

// ── REST Routes ───────────────────────────────────────────────────────────────
app.use('/api', roomRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), maxRoomSize: MAX_ROOM_SIZE });
});

// ── WebSocket Server ──────────────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout:  PING_TIMEOUT,
  pingInterval: PING_INTERVAL
});

// Register modular socket logic (pass maxRoomSize for enforcement)
registerSocketHandlers(io, MAX_ROOM_SIZE);

server.listen(PORT, () => {
  console.log(`🚀 Music Together Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready | CORS: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`🌐 REST API: http://localhost:${PORT}/api`);
});
