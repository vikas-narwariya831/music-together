const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  username: { 
    type: String, 
    required: true,
    trim: true
  },
  lastSeen: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  bufferCommands: false // Never hang queries if DB is offline/connecting
});

// Explicitly use collection 'mt_users' to avoid collision with legacy 'users' index (e.g. email_1)
module.exports = mongoose.model('User', UserSchema, 'mt_users');
