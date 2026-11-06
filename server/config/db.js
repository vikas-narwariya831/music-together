const mongoose = require('mongoose');
const dns = require('dns');

// Fix Windows Node.js querySrv ECONNREFUSED bug for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not found in environment variables. Running in memory-only mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🍃 Connected to MongoDB Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('ℹ️ Tip: Agar Atlas me IP whitelist error aaye, toh MongoDB Atlas me "Network Access" me jaakar 0.0.0.0/0 allow kar dena.');
  }
};

module.exports = connectDB;
