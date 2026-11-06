import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const YouTubeAudioBridge = forwardRef(function YouTubeAudioBridge(
  { videoId, isPlaying, volume, isMuted, onProgress, onDuration, onEnded, onBuffering, onError },
  ref
) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const currentVideoIdRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true);
      }
    },
    play: () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          if (!isMuted && typeof playerRef.current.unMute === 'function') {
            playerRef.current.unMute();
            playerRef.current.setVolume(Math.round((volume || 0.85) * 100));
          }
        } catch (e) {}
        playerRef.current.playVideo();
      }
    },
    pause: () => {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    }
  }));

  useEffect(() => {
    if (!videoId) {
      if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      }
      return;
    }

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initOrSwitchPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      // If YouTube player is already instantiated, STOP OLD AND LOAD NEW!
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        if (currentVideoIdRef.current !== videoId) {
          currentVideoIdRef.current = videoId;
          console.log(`[YouTubeAudioBridge] 🔄 Switching to track: ${videoId}`);
          try {
            playerRef.current.stopVideo();
            playerRef.current.loadVideoById({
              videoId: videoId,
              startSeconds: 0
            });
            if (isPlaying) {
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } catch (err) {
            console.warn('[YouTubeAudioBridge] Switch error:', err);
          }
        }
        return;
      }

      currentVideoIdRef.current = videoId;
      playerRef.current = new window.YT.Player('yt-audio-bridge-div', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            const currentVol = isMuted ? 0 : Math.round((volume || 0.85) * 100);
            event.target.setVolume(currentVol);
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }

            if (isPlaying) {
              event.target.unMute();
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
            if (onDuration) {
              onDuration(event.target.getDuration());
            }
          },
          onStateChange: (event) => {
            // -1: UNSTARTED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 0: ENDED
            if (event.data === 3) {
              if (onBuffering) onBuffering(true);
            } else if (event.data === 1) {
              if (onBuffering) onBuffering(false);
              if (onDuration) onDuration(playerRef.current.getDuration());
            } else if (event.data === 2) {
              if (onBuffering) onBuffering(false);
            } else if (event.data === 0) {
              if (onBuffering) onBuffering(false);
              if (onEnded) onEnded();
            }
          },
          onError: (event) => {
            console.warn('YouTube Bridge embed restriction code:', event.data);
            if (onBuffering) onBuffering(false);
            if (onError) onError(event.data);
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initOrSwitchPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initOrSwitchPlayer;
    }

    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const curr = playerRef.current.getCurrentTime();
        if (curr !== undefined && onProgress) {
          onProgress(curr);
        }
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId]);

  // Sync isPlaying state
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {}
  }, [isPlaying]);

  // Sync Volume & Mute dynamically with slider
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.setVolume !== 'function') return;
    try {
      const volPercent = Math.round((volume ?? 0.85) * 100);
      playerRef.current.setVolume(volPercent);

      if (isMuted || volume === 0) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    } catch (e) {}
  }, [volume, isMuted]);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        width: '180px', 
        height: '140px', 
        opacity: 0.01, 
        pointerEvents: 'none', 
        zIndex: -1 
      }}
    >
      <div id="yt-audio-bridge-div"></div>
    </div>
  );
});

export default YouTubeAudioBridge;
