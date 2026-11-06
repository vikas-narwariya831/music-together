import React, { useState } from 'react';
import { Plus, X, Sparkles, Music } from 'lucide-react';
import { YouTubeIcon } from './YouTubeIcon';

export default function YouTubeModal({
  isOpen,
  onClose,
  onAddYouTubeTrack
}) {
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ytUrl.trim()) return;

    const videoId = extractYouTubeId(ytUrl.trim());
    if (!videoId) {
      setError('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)');
      return;
    }

    setError('');
    const track = {
      id: 'yt-' + videoId + '-' + Date.now(),
      title: ytTitle.trim() || 'YouTube Jam Video',
      artist: 'YouTube Streaming',
      src: ytUrl.trim(),
      videoId: videoId,
      isYouTube: true,
      duration: 240,
      cover: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      collectionName: 'YouTube Live'
    };

    onAddYouTubeTrack(track);
    setYtUrl('');
    setYtTitle('');
    onClose();
  };

  const sampleVideos = [
    { title: 'Kesariya - Brahmāstra', url: 'https://www.youtube.com/watch?v=BddP6PYo2gs' },
    { title: 'Excuses - AP Dhillon', url: 'https://www.youtube.com/watch?v=vX2cDW8LUWk' },
    { title: 'Kahani Suno 2.0 - Kaifi Khalil', url: 'https://www.youtube.com/watch?v=_XBVWlI8TsQ' },
    { title: 'Starboy - The Weeknd', url: 'https://www.youtube.com/watch?v=34Na4j8AVgA' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content yt-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="yt-modal-header">
          <div className="yt-icon-glow">
            <YouTubeIcon size={32} color="#ff0000" />
          </div>
          <h2>YouTube Watch & Listen Together</h2>
          <p className="yt-modal-sub">
            Paste any YouTube video or song link — friends in the room will see and listen to it synchronously!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="yt-form">
          <div className="input-group">
            <label>YouTube Link (URL)</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => {
                setYtUrl(e.target.value);
                setError('');
              }}
              required
            />
          </div>

          <div className="input-group">
            <label>Song Title / Video Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. My Favorite YouTube Music Video"
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
            />
          </div>

          {error && <p className="yt-error-msg">{error}</p>}

          <button type="submit" className="btn-yt-submit">
            <Plus size={18} />
            <span>Play in MusicTogether</span>
          </button>
        </form>

        <div className="sample-yt-section">
          <span className="sample-label">Or quick pick popular picks:</span>
          <div className="sample-chips">
            {sampleVideos.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-yt"
                onClick={() => {
                  setYtUrl(s.url);
                  setYtTitle(s.title);
                }}
              >
                🎬 {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
