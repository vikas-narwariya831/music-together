/**
 * useDocumentTitle — updates browser tab title with now-playing info
 * Shows: ♪ Song - Artist | MusicTogether   when playing
 * Shows: MusicTogether                     when stopped
 */
import { useEffect } from 'react';

const APP_NAME = 'MusicTogether';

export function useDocumentTitle(track, isPlaying) {
  useEffect(() => {
    if (isPlaying && track?.title) {
      document.title = `♪ ${track.title}${track.artist ? ` — ${track.artist}` : ''} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }

    // Reset on unmount
    return () => { document.title = APP_NAME; };
  }, [track, isPlaying]);
}
