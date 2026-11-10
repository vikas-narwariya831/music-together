/**
 * useKeyboardShortcuts — global keyboard shortcuts for music player
 * Space     → Play / Pause
 * ArrowRight → Next Track
 * ArrowLeft  → Prev Track
 * M          → Mute / Unmute
 */
import { useEffect } from 'react';

export function useKeyboardShortcuts({ onTogglePlay, onNextTrack, onPrevTrack, onToggleMute }) {
  useEffect(() => {
    const handler = (e) => {
      // Don't fire when user is typing in an input / textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextTrack?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevTrack?.();
          break;
        case 'KeyM':
          onToggleMute?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onTogglePlay, onNextTrack, onPrevTrack, onToggleMute]);
}
