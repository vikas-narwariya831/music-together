const User = require('../models/User');

// POST /api/user/profile - Save/Update user nickname linked to browserId
const saveUserProfile = async (req, res) => {
  try {
    const { browserId, username } = req.body;
    if (!browserId || !username) {
      return res.status(400).json({ success: false, message: 'browserId and username are required' });
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
    console.error('Error saving user profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/user/profile/:browserId - Fetch user nickname from DB for this browser
const getUserProfile = async (req, res) => {
  try {
    const { browserId } = req.params;
    if (!browserId) {
      return res.status(400).json({ success: false, message: 'browserId required' });
    }

    const user = await User.findOne({ userId: browserId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in DB' });
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
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveUserProfile,
  getUserProfile
};
