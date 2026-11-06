const yts = require('yt-search');
const { rooms, DEFAULT_TRACKS, getLivePlaybackTime } = require('../data/roomsStore');

// GET /api/search?q=query - Full-length songs via YouTube/Audio Search
const searchFullSongs = async (req, res) => {
  try {
    const query = req.query.q || 'Arijit Singh';
    const searchResults = await yts(query);

    if (!searchResults || !searchResults.videos) {
      return res.json({ success: true, tracks: [] });
    }

    const tracks = searchResults.videos.slice(0, 20).map((v) => ({
      id: 'yt-' + v.videoId,
      title: v.title,
      artist: v.author?.name || 'Artist',
      src: v.url,
      videoId: v.videoId,
      duration: v.seconds || 240,
      cover: v.thumbnail || v.image,
      isYouTube: true,
      views: v.views,
      timestamp: v.timestamp
    }));

    res.json({ success: true, tracks });
  } catch (error) {
    console.error('Search full songs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms - Get all active rooms overview
const getActiveRooms = (req, res) => {
  try {
    const roomList = [];
    rooms.forEach((room, roomId) => {
      roomList.push({
        id: roomId,
        memberCount: room.members.length,
        currentTrack: room.playlist[room.currentTrackIndex]?.title || 'No Track',
        isPlaying: room.isPlaying
      });
    });
    res.json({ success: true, count: roomList.length, rooms: roomList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms/:roomId - Check room status and details
const getRoomDetails = (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId.toLowerCase());

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found or empty' });
    }

    res.json({
      success: true,
      room: {
        id: room.id,
        memberCount: room.members.length,
        members: room.members,
        currentTrack: room.playlist[room.currentTrackIndex],
        isPlaying: room.isPlaying,
        liveTime: getLivePlaybackTime(room),
        playlistLength: room.playlist.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tracks/catalog - Get curated ready-to-play tracks
const getCatalogTracks = (req, res) => {
  try {
    res.json({ success: true, tracks: DEFAULT_TRACKS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  searchFullSongs,
  getActiveRooms,
  getRoomDetails,
  getCatalogTracks
};
