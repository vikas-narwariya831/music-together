/**
 * AudioCoordinator Utility
 * Guarantees exclusive audio playback across HTML5 Audio and YouTube iframes.
 * Prevents multiple tracks from playing concurrently or overlapping.
 */

class AudioCoordinator {
  constructor() {
    this.htmlAudioElement = null;
    this.ytPlayerInstance = null;
    this.currentTrackId = null;
    this.activeType = null; // 'audio' | 'youtube' | null
    this.lock = false;
  }

  registerAudio(audioEl) {
    this.htmlAudioElement = audioEl;
  }

  registerYTPlayer(player) {
    this.ytPlayerInstance = player;
  }

  /**
   * Stop any active audio immediately before loading/switching to a new track.
   */
  stopAll() {
    // 1. Hard stop HTML5 Audio
    if (this.htmlAudioElement) {
      try {
        this.htmlAudioElement.pause();
        this.htmlAudioElement.currentTime = 0;
      } catch (err) {
        console.warn('[AudioCoordinator] Error pausing HTML5 audio:', err);
      }
    }

    // 2. Hard stop YouTube Iframe Player
    if (this.ytPlayerInstance) {
      try {
        if (typeof this.ytPlayerInstance.stopVideo === 'function') {
          this.ytPlayerInstance.stopVideo();
        } else if (typeof this.ytPlayerInstance.pauseVideo === 'function') {
          this.ytPlayerInstance.pauseVideo();
        }
      } catch (err) {
        console.warn('[AudioCoordinator] Error stopping YouTube player:', err);
      }
    }

    // Also stop any rogue audio elements on the DOM
    try {
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(el => {
        if (el !== this.htmlAudioElement) {
          el.pause();
          el.currentTime = 0;
        }
      });
    } catch (e) {}

    this.activeType = null;
  }

  /**
   * Transition to a new track cleanly with a unique track token
   */
  prepareTrack(track) {
    if (!track) return false;
    const trackId = track.videoId || track.src || track.id || track.title;
    
    // Always stop everything first to guarantee no duplicate sound
    this.stopAll();
    this.currentTrackId = trackId;
    this.activeType = track.isYouTube ? 'youtube' : 'audio';

    return true;
  }

  getCurrentTrackId() {
    return this.currentTrackId;
  }

  isCurrentTrack(track) {
    if (!track) return false;
    const trackId = track.videoId || track.src || track.id || track.title;
    return this.currentTrackId === trackId;
  }
}

export const audioCoordinator = new AudioCoordinator();
export default audioCoordinator;
