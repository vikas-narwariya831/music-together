import React from 'react';
import { Radio } from 'lucide-react';

export default function JoinRoomScreen({
  username,
  setUsername,
  roomId,
  setRoomId,
  activeRooms,
  onJoin
}) {
  return (
    <div className="join-container">
      <div className="join-card">
        <div className="logo-badge">
          <Radio className="radio-icon pulse-animation" />
        </div>
        <h1>MusicTogether</h1>
        <p className="subtitle">Listen to synced music in real-time with your friends!</p>

        <form onSubmit={onJoin} className="join-form">
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul, Priya"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Room Name / Code</label>
            <div className="room-input-wrapper">
              <input
                type="text"
                placeholder="e.g. party-room, chill-vibes"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-random"
                onClick={() => setRoomId('vibe-' + Math.floor(1000 + Math.random() * 9000))}
              >
                Random
              </button>
            </div>
          </div>

          <button type="submit" className="btn-join">
            Enter Music Room 🎧
          </button>
        </form>

        {/* Live Active Rooms fetched via Axios REST API */}
        {activeRooms.length > 0 && (
          <div className="active-rooms-preview">
            <span className="preview-label">Live Active Rooms:</span>
            <div className="active-rooms-badges">
              {activeRooms.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="room-pill-btn"
                  onClick={() => setRoomId(r.id)}
                >
                  ⚡ {r.id} ({r.memberCount} 👤)
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="feature-hints">
          <span>✨ Real-time Audio Sync</span>
          <span>💬 Live Chat</span>
          <span>👥 Multi-friend Rooms</span>
        </div>
      </div>
    </div>
  );
}
