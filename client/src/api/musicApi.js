import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Search Full-Length songs (YouTube Music engine backend - No 30 sec limit!)
export const searchFullSongs = async (query = 'Arijit Singh') => {
  try {
    const response = await api.get('/search', {
      params: { q: query }
    });
    return response.data?.tracks || [];
  } catch (error) {
    console.error('Full songs search API error:', error);
    return [];
  }
};

// Fetch all active rooms
export const fetchActiveRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

// Fetch specific room status
export const fetchRoomDetails = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

// Apple iTunes Search API (Backup 30s preview)
export const searchITunesSongs = async (term = 'bollywood hits', limit = 25) => {
  try {
    const encoded = encodeURIComponent(term.trim());
    const response = await axios.get(
      `https://itunes.apple.com/search?term=${encoded}&entity=song&limit=${limit}`
    );
    
    if (response.data && response.data.results) {
      return response.data.results
        .filter(item => item.previewUrl)
        .map(item => ({
          id: 'itunes-' + item.trackId,
          title: item.trackName,
          artist: item.artistName,
          src: item.previewUrl,
          duration: 30,
          cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
          collectionName: item.collectionName || 'Single'
        }));
    }
    return [];
  } catch (error) {
    console.error('iTunes API Search error:', error);
    return [];
  }
};

export default api;
