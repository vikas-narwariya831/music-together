const express = require('express');
const router = express.Router();
const { 
  searchFullSongs,
  getActiveRooms, 
  getRoomDetails, 
  getCatalogTracks 
} = require('../controllers/roomController');

router.get('/search', searchFullSongs);
router.get('/rooms', getActiveRooms);
router.get('/rooms/:roomId', getRoomDetails);
router.get('/tracks/catalog', getCatalogTracks);

module.exports = router;
