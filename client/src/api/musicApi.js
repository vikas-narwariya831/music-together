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

const AUDIUS_API_BASE = 'https://api.audius.co/v1';
const AUDIUS_APP_NAME = 'MusicTogether';
const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80';

/**
 * Extract a valid 11-char YouTube videoId from any YouTube URL (watch, youtu.be, shorts, embed)
 */
export const extractYouTubeVideoId = (url = '') => {
  const match = url.trim().match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2] && match[2].length === 11 ? match[2] : null;
};

/**
 * Map a raw Audius track into MusicTogether's unified track shape
 */
const mapAudiusTrack = (item) => ({
  id: 'audius-' + item.id,
  title: item.title || 'Untitled Track',
  artist: item.user?.name || item.user?.handle || 'Audius Artist',
  src: `${AUDIUS_API_BASE}/tracks/${item.id}/stream?app_name=${AUDIUS_APP_NAME}`,
  duration: item.duration || 180,
  cover:
    item.artwork?.['480x480'] ||
    item.artwork?.['1000x1000'] ||
    item.artwork?.['150x150'] ||
    FALLBACK_COVER,
  collectionName: item.genre || 'Audius Full Track',
  source: 'audius',
  isYouTube: false
});

const isPlayableAudiusTrack = (item) =>
  Boolean(
    item &&
      item.id &&
      item.is_streamable !== false &&
      item.access?.stream !== false &&
      !item.stream_conditions
  );

/**
 * Fetch trending full-length audio tracks from Audius (free, no API key, CORS-enabled)
 */
export const fetchAudiusTrending = async (limit = 25) => {
  try {
    const response = await axios.get(`${AUDIUS_API_BASE}/tracks/trending`, {
      params: { app_name: AUDIUS_APP_NAME, limit },
      timeout: 10000
    });
    const list = response.data?.data || [];
    return list.filter(isPlayableAudiusTrack).map(mapAudiusTrack);
  } catch (error) {
    console.warn('Audius trending error:', error.message);
    return [];
  }
};

/**
 * Search full-length pure audio tracks via Audius REST API (no 30s limit!)
 */
export const searchAudiusSongs = async (query = 'lofi', limit = 25) => {
  try {
    const response = await axios.get(`${AUDIUS_API_BASE}/tracks/search`, {
      params: { query: query.trim(), app_name: AUDIUS_APP_NAME, limit },
      timeout: 10000
    });
    const list = response.data?.data || [];
    return list.filter(isPlayableAudiusTrack).map(mapAudiusTrack);
  } catch (error) {
    console.warn('Audius search error:', error.message);
    return [];
  }
};

// Frontend-first legal music search:
// 1. Direct YouTube URL -> plays via official YouTube IFrame API (client-side)
// 2. "Trending Full" -> Audius trending full-length pure audio streams
// 3. Text query -> Audius full-length pure audio first, iTunes 30s preview fallback if sparse
export const searchFullSongs = async (query = 'Trending Full') => {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];

  // 1. Check if user pasted a direct YouTube URL in search bar
  const ytId = extractYouTubeVideoId(trimmed);
  if (ytId) {
    return [
      {
        id: `yt-${ytId}-${Date.now()}`,
        title: 'YouTube Track',
        artist: 'YouTube IFrame Player',
        src: trimmed,
        videoId: ytId,
        duration: 240,
        cover: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        isYouTube: true,
        source: 'youtube',
        collectionName: 'YouTube Embed'
      }
    ];
  }

  // 2. Trending full tracks shortcut
  if (/^trending/i.test(trimmed)) {
    const trending = await fetchAudiusTrending(25);
    if (trending.length > 0) return trending;
  }

  // 3. Primary: Audius full-length pure audio search
  const audiusTracks = await searchAudiusSongs(trimmed, 25);
  if (audiusTracks.length >= 3) {
    return audiusTracks;
  }

  // 4. Fallback: Apple iTunes Search API (for commercial Bollywood/Pop queries with few Audius hits)
  const iTunesTracks = await searchITunesSongs(trimmed, 25);
  if (audiusTracks.length > 0 || iTunesTracks.length > 0) {
    return [...audiusTracks, ...iTunesTracks];
  }

  // 5. Final fallback: curated backend catalog
  try {
    const response = await api.get('/tracks/catalog');
    return response.data?.tracks || [];
  } catch (error) {
    console.error('Catalog fallback error:', error);
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
          cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : FALLBACK_COVER,
          collectionName: item.collectionName || 'Single',
          source: 'itunes',
          isYouTube: false
        }));
    }
    return [];
  } catch (error) {
    console.error('iTunes API Search error:', error);
    return [];
  }
};

export default api;
