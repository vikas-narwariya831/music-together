const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// POST /api/user/profile - Save/Update user nickname linked to browserId
const saveUserProfile = async (req, res) => {
  try {
    const { browserId, username } = req.body;
    if (!browserId || !username) {
      return res.status(400).json({ success: false, message: 'browserId and username are required' });
    }

    await connectDB();

    // If MongoDB is not connected (e.g. missing MONGODB_URI on Vercel), respond immediately
    if (mongoose.connection.readyState !== 1) {
      return res.json({ 
        success: false, 
        message: 'MongoDB not connected. Add MONGODB_URI to Vercel environment variables.' 
      });
    }

    const cleanName = username.trim();
    const user = await User.findOneAndUpdate(
      { userId: browserId },
      { username: cleanName, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      user: {
        browserId: user.userId,
        username: user.username,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Error saving user profile:', error.message);
    res.status(200).json({ success: false, message: error.message });
  }
};

// GET /api/user/profile/:browserId - Fetch user nickname from DB for this browser
const getUserProfile = async (req, res) => {
  try {
    const { browserId } = req.params;
    if (!browserId) {
      return res.status(400).json({ success: false, message: 'browserId required' });
    }

    await connectDB();

    // If MongoDB is not connected, respond immediately without hanging for 10s!
    if (mongoose.connection.readyState !== 1) {
      return res.json({ 
        success: false, 
        message: 'MongoDB not connected on host' 
      });
    }

    const user = await User.findOne({ userId: browserId });
    if (!user) {
      return res.json({ success: false, message: 'User not found in DB' });
    }

    res.json({
      success: true,
      user: {
        browserId: user.userId,
        username: user.username,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.warn('Error fetching user profile:', error.message);
    res.status(200).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveUserProfile,
  getUserProfile
};
