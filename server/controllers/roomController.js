const { rooms, DEFAULT_TRACKS, getLivePlaybackTime } = require('../data/roomsStore');

// GET /api/search?q=query - Official iTunes Search API + curated catalog fallback (No YouTube scraping)
const searchFullSongs = async (req, res) => {
  try {
    const query = (req.query.q || 'Arijit Singh').trim();
    const encoded = encodeURIComponent(query);

    const response = await fetch(
      `https://itunes.apple.com/search?term=${encoded}&entity=song&limit=25`
    );

    if (!response.ok) {
      throw new Error(`iTunes API responded with ${response.status}`);
    }

    const data = await response.json();
    const tracks = (data?.results || [])
      .filter((item) => item.previewUrl)
      .map((item) => ({
        id: 'itunes-' + item.trackId,
        title: item.trackName,
        artist: item.artistName,
        src: item.previewUrl,
        duration: 30,
        cover: item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', '600x600bb')
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
        collectionName: item.collectionName || 'Single',
        isYouTube: false
      }));

    res.json({ success: true, source: 'itunes', tracks });
  } catch (error) {
    console.error('Search songs error:', error.message);
    res.json({ success: true, source: 'catalog', tracks: DEFAULT_TRACKS });
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
