require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const roomRoutes = require('./routes/roomRoutes');
const { registerSocketHandlers } = require('./sockets/musicSocket');

// Connect to MongoDB Atlas
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// REST APIs (Room discovery, track catalog, health check)
app.use('/api', roomRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Create HTTP and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 20000,
  pingInterval: 10000
});

// Register modular socket logic
registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Music Together Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time sync`);
  console.log(`🌐 REST API: http://localhost:${PORT}/api`);
});
