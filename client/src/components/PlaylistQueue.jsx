import React from 'react';
import { Music, Plus } from 'lucide-react';

export default function PlaylistQueue({
  playlist,
  currentTrackIndex,
  isPlaying,
  onSelectTrack,
  onOpenAddModal
}) {
  return (
    <div className="panel queue-panel">
      <div className="panel-header">
        <div className="flex-row">
          <Music size={18} />
          <h3>Playlist Queue</h3>
        </div>
        <button className="btn-add-track" onClick={onOpenAddModal}>
          <Plus size={16} /> Add Track
        </button>
      </div>

      <div className="queue-list">
        {playlist.map((track, idx) => (
          <div
            key={track.id || idx}
            className={`queue-item ${idx === currentTrackIndex ? 'active' : ''}`}
            onClick={() => onSelectTrack(idx)}
          >
            <img src={track.cover} alt={track.title} className="queue-thumb" />
            <div className="queue-info">
              <span className="queue-title">{track.title}</span>
              <span className="queue-artist">{track.artist}</span>
            </div>
            {idx === currentTrackIndex && isPlaying && (
              <div className="playing-bars">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
