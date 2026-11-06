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
});

module.exports = mongoose.model('User', UserSchema);
