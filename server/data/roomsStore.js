const DEFAULT_TRACKS = [
  {
    id: 'track-1',
    title: 'Sunny Days - Acoustic Chill',
    artist: 'Bensound',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'
  },
  {
    id: 'track-2',
    title: 'Neon Groove - Synthwave',
    artist: 'SoundHelix Collective',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 423,
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80'
  },
  {
    id: 'track-3',
    title: 'Midnight Lo-Fi Beat',
    artist: 'Chillout Crew',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 345,
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80'
  },
  {
    id: 'track-4',
    title: 'Sunset Electronic Voyage',
    artist: 'Aero Echo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 302,
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'
  }
];

// In-memory rooms store
const rooms = new Map();

function getLivePlaybackTime(room) {
  if (!room.isPlaying) {
    return room.currentTime;
  }
  const elapsed = (Date.now() - room.lastUpdated) / 1000;
  return room.currentTime + elapsed;
}

module.exports = {
  DEFAULT_TRACKS,
  rooms,
  getLivePlaybackTime
};
