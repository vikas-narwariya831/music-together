const mongoose = require('mongoose');
const dns = require('dns');

// Fix Windows Node.js querySrv ECONNREFUSED bug for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not found in environment variables. Running in memory-only mode.');
    return null;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      bufferCommands: false // Never hang/buffer queries for 10s if DB is offline or connecting!
    }).catch(err => {
      cachedPromise = null;
      throw err;
    });
  }

  try {
    const conn = await cachedPromise;
    console.log(`🍃 Connected to MongoDB Atlas: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.warn('❌ MongoDB Connection Error:', error.message);
    return null;
  }
};

module.exports = connectDB;
