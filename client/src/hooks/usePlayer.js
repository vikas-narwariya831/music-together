import { useState, useCallback } from 'react';

/**
 * usePlayer — manages all music player state & logic
 * Shuffle and Repeat are now FULLY functional.
 */
export function usePlayer(playlist = [], onSocketSeek, onSocketPlay, onSocketPause, onSocketNext, onSocketPrev) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying]                 = useState(false);
  const [isBuffering, setIsBuffering]             = useState(false);
  const [currentTime, setCurrentTime]             = useState(0);
  const [duration, setDuration]                   = useState(30);
  const [volume, setVolume]                       = useState(0.85);
  const [isMuted, setIsMuted]                     = useState(false);
  const [isShuffle, setIsShuffle]                 = useState(false);
  const [repeatMode, setRepeatMode]               = useState('none'); // 'none' | 'one' | 'all'

  // ── Shuffle ───────────────────────────────────────────────────────────────
  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  // ── Repeat — cycles: none → one → all → none ─────────────────────────────
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'one';
      if (prev === 'one')  return 'all';
      return 'none';
    });
  }, []);

  // ── Next Track (respects shuffle & repeat) ────────────────────────────────
  const getNextIndex = useCallback((currentIdx, total) => {
    if (repeatMode === 'one') return currentIdx;
    if (isShuffle) {
      let next;
      do { next = Math.floor(Math.random() * total); } while (next === currentIdx && total > 1);
      return next;
    }
    if (currentIdx + 1 >= total) return repeatMode === 'all' ? 0 : currentIdx;
    return currentIdx + 1;
  }, [isShuffle, repeatMode]);

  // ── Prev Track ────────────────────────────────────────────────────────────
  const getPrevIndex = useCallback((currentIdx, total) => {
    if (currentIdx === 0) return repeatMode === 'all' ? total - 1 : 0;
    return currentIdx - 1;
  }, [repeatMode]);

  // ── Format mm:ss ─────────────────────────────────────────────────────────
  const formatTime = useCallback((secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    currentTrackIndex, setCurrentTrackIndex,
    isPlaying, setIsPlaying,
    isBuffering, setIsBuffering,
    currentTime, setCurrentTime,
    duration, setDuration,
    volume, setVolume,
    isMuted, setIsMuted,
    isShuffle, toggleShuffle,
    repeatMode, toggleRepeat,
    getNextIndex,
    getPrevIndex,
    formatTime,
  };
}
