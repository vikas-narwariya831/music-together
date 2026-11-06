import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

export default function PlayerStage({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  formatTime,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSeek,
  onVolumeChange,
  onToggleMute
}) {
  return (
    <main className="player-stage">
      {/* Spinning Vinyl Visualizer */}
      <div className="vinyl-container">
        <div className={`vinyl-disc ${isPlaying ? 'spinning' : ''}`}>
          <img src={currentTrack.cover} alt="Album Art" className="album-art" />
          <div className="vinyl-center-pin"></div>
        </div>
      </div>

      <div className="track-details">
        <h2 className="current-title">{currentTrack.title}</h2>
        <p className="current-artist">{currentTrack.artist}</p>
      </div>

      {/* Progress Timeline */}
      <div className="timeline-section">
        <span className="time-display">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={onSeek}
          className="seek-bar"
        />
        <span className="time-display">{formatTime(duration)}</span>
      </div>

      {/* Controls Bar */}
      <div className="controls-row">
        <button className="control-btn" onClick={onPrevTrack} title="Previous Track">
          <SkipBack size={22} />
        </button>

        <button
          className="play-pause-btn"
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
        </button>

        <button className="control-btn" onClick={onNextTrack} title="Next Track">
          <SkipForward size={22} />
        </button>

        {/* Volume Slider */}
        <div className="volume-control">
          <button className="volume-btn" onClick={onToggleMute}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={onVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
    </main>
  );
}
