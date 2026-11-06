import React from 'react';
import { X, Music } from 'lucide-react';

export default function AddTrackModal({
  isOpen,
  onClose,
  customTitle,
  setCustomTitle,
  customArtist,
  setCustomArtist,
  customUrl,
  setCustomUrl,
  onAddTrack
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
            <Music size={22} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Add Custom Song</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Stream any direct MP3/audio link (Dropbox, Discord, Cloud storage)
          </p>
        </div>

        <form onSubmit={onAddTrack} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Song Title</label>
            <input
              type="text"
              placeholder="e.g. Tum Hi Ho / Daylight"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Artist Name</label>
            <input
              type="text"
              placeholder="e.g. Arijit Singh / Taylor Swift"
              value={customArtist}
              onChange={(e) => setCustomArtist(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Audio Stream URL (MP3/AAC)</label>
            <input
              type="url"
              placeholder="https://.../song.mp3"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              Add to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
