const express = require('express');
const router = express.Router();
const { 
  searchFullSongs,
  getActiveRooms, 
  getRoomDetails, 
  getCatalogTracks 
} = require('../controllers/roomController');
const {
  saveUserProfile,
  getUserProfile
} = require('../controllers/userController');

// Music & Rooms
router.get('/search', searchFullSongs);
router.get('/rooms', getActiveRooms);
router.get('/rooms/:roomId', getRoomDetails);
router.get('/tracks/catalog', getCatalogTracks);

// User Profile (DB Persistence via Browser ID)
router.post('/user/profile', saveUserProfile);
router.get('/user/profile/:browserId', getUserProfile);

module.exports = router;
