const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String, default: 'Unknown Artist' },
  src: { type: String, required: true },
  videoId: { type: String },
  duration: { type: Number, default: 180 },
  cover: { type: String },
  isYouTube: { type: Boolean, default: false }
}, { _id: false });

const RoomSchema = new mongoose.Schema({
  roomId: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  hostUserId: { type: String },
  hostName: { type: String, default: 'Host' },
  playlist: [TrackSchema],
  currentTrackIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  bufferCommands: false
});

module.exports = mongoose.model('Room', RoomSchema);
