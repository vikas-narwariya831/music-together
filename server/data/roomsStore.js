const DEFAULT_TRACKS = [
  {
    id: "yt-O5gwxm3NxFU",
    title: "Best Of Arijit Singh 2024 | Arijit Singh Hits Songs",
    artist: "Arijit Singh",
    src: "https://youtube.com/watch?v=O5gwxm3NxFU",
    videoId: "O5gwxm3NxFU",
    duration: 3652,
    cover: "https://i.ytimg.com/vi/O5gwxm3NxFU/hq720.jpg",
    isYouTube: true
  },
  {
    id: "yt-BPZkZpGMpXA",
    title: "Tu Mil Jaaye | Shah Rukh Khan | Arijit Singh",
    artist: "Arijit Singh",
    src: "https://youtube.com/watch?v=BPZkZpGMpXA",
    videoId: "BPZkZpGMpXA",
    duration: 223,
    cover: "https://i.ytimg.com/vi/BPZkZpGMpXA/hq720.jpg",
    isYouTube: true
  },
  {
    id: "yt-MJyKN-8UncM",
    title: "Shayad - Love Aaj Kal | Arijit Singh",
    artist: "Arijit Singh",
    src: "https://youtube.com/watch?v=MJyKN-8UncM",
    videoId: "MJyKN-8UncM",
    duration: 190,
    cover: "https://i.ytimg.com/vi/MJyKN-8UncM/hq720.jpg",
    isYouTube: true
  },
  {
    id: "yt-aNToVeBBKn4",
    title: "Aashiqui 2: Aasan Nahin Yahan | Arijit Singh",
    artist: "Arijit Singh",
    src: "https://youtube.com/watch?v=aNToVeBBKn4",
    videoId: "aNToVeBBKn4",
    duration: 215,
    cover: "https://i.ytimg.com/vi/aNToVeBBKn4/hq720.jpg",
    isYouTube: true
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
