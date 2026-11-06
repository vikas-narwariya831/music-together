import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const BACKEND_BASE_URL = isLocal ? 'http://localhost:5000' : (import.meta.env.VITE_BACKEND_URL || 'https://server-chi-liard.vercel.app');

const api = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
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
  try {
    const response = await api.get('/rooms');
    return response.data?.rooms || response.data || [];
  } catch (error) {
    console.warn('fetchActiveRooms error:', error.message);
    return [];
  }
};

// Fetch specific room status
export const fetchRoomDetails = async (roomId) => {
  try {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.warn(`fetchRoomDetails error for room ${roomId}:`, error.message);
    return null;
  }
};

// Save user nickname linked to persistent browser ID in MongoDB
export const saveUserProfileToDB = async (browserId, username) => {
  try {
    const response = await api.post('/user/profile', { browserId, username }, { timeout: 6000 });
    return response.data || { success: true };
  } catch (error) {
    console.warn('saveUserProfileToDB error:', error.message);
    const msg = error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'Database connection timed out' : error.message);
    return { success: false, message: msg };
  }
};

// Fetch user profile from MongoDB by browser ID
export const fetchUserProfileFromDB = async (browserId) => {
  try {
    const response = await api.get(`/user/profile/${browserId}`, { timeout: 3000 });
    return response.data?.user || null;
  } catch (error) {
    // Graceful fallback for offline DB or first time visitors
    return null;
  }
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
