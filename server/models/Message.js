const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  roomId: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String },
  isSystem: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  bufferCommands: false
});

module.exports = mongoose.model('Message', MessageSchema, 'mt_messages');
