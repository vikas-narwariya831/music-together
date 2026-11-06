import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Volume1,
  VolumeX, 
  Shuffle, 
  Repeat,
  Heart
} from 'lucide-react';

export default function BottomPlayerBar({
  currentTrack = {},
  isPlaying = false,
  currentTime = 0,
  duration = 180,
  volume = 0.85,
  isMuted = false,
  formatTime,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSeek,
  onVolumeChange,
  onToggleMute,
  isSessionActive = false,
  onOpenSessionModal
}) {
  const currentDuration = duration > 0 ? duration : 180;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / currentDuration) * 100));
  const effectiveVolume = isMuted ? 0 : volume;
  const volumePercent = Math.round(effectiveVolume * 100);

  return (
    <footer className="h-22 px-4 sm:px-6 md:px-8 shrink-0 border-t border-white/[0.12] bg-white/[0.04] backdrop-blur-3xl flex items-center justify-between gap-4 z-40 select-none shadow-[0_-12px_40px_rgba(0,0,0,0.6)]">
      {/* 1. Track Info (Glass Card Look) */}
      <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-[240px] md:max-w-[280px] shrink-0">
        <div className="relative group shrink-0">
          <img 
            src={currentTrack.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'} 
            alt={currentTrack.title} 
            className="w-13 h-13 rounded-2xl object-cover shadow-lg ring-1 ring-white/20" 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
            }}
          />
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs sm:text-sm font-semibold text-white truncate hover:underline cursor-pointer">
            {currentTrack.title || 'No Song Selected'}
          </span>
          <span className="text-[11px] font-medium text-zinc-300 truncate hover:text-white cursor-pointer mt-0.5">
            {currentTrack.artist || 'Select a track to play'}
          </span>
        </div>

        <button 
          type="button" 
          className="text-zinc-400 hover:text-rose-400 transition-colors p-1 shrink-0 hidden sm:block cursor-pointer"
          title="Favorite"
        >
          <Heart size={16} />
        </button>
      </div>

      {/* 2. Centered Transport & Glass Scrub Bar */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl mx-2 sm:mx-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            type="button" 
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block" 
            title="Shuffle"
          >
            <Shuffle size={15} />
          </button>
          
          <button 
            type="button" 
            onClick={onPrevTrack} 
            className="text-zinc-300 hover:text-white transition-colors active:scale-95 cursor-pointer" 
            title="Previous"
          >
            <SkipBack size={18} />
          </button>
          
          {/* Circular Play/Pause Button with Glass Ring */}
          <button 
            type="button"
            onClick={onTogglePlay} 
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-white to-zinc-200 hover:to-white text-zinc-950 flex items-center justify-center shadow-lg shadow-white/20 ring-4 ring-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button 
            type="button" 
            onClick={onNextTrack} 
            className="text-zinc-300 hover:text-white transition-colors active:scale-95 cursor-pointer" 
            title="Next"
          >
            <SkipForward size={18} />
          </button>
          
          <button 
            type="button" 
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer hidden sm:block" 
            title="Repeat"
          >
            <Repeat size={15} />
          </button>
        </div>

        {/* Scrub Timeline with Dual-Color Fill Track */}
        <div className="flex items-center gap-2.5 w-full">
          <span className="text-[10px] font-mono text-zinc-300 w-9 text-right font-medium">
            {formatTime(currentTime)}
          </span>

          {/* Interactive Scrub Bar with Progress Gradient Fill */}
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek({ target: { value: ratio * currentDuration } });
            }}
            className="relative flex-1 h-3 flex items-center cursor-pointer group"
          >
            {/* Background Track */}
            <div className="w-full h-1.5 group-hover:h-2 rounded-full bg-white/15 overflow-hidden transition-all relative">
              {/* Active Filled Gradient */}
              <div 
                className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            {/* Draggable Glowing Handle */}
            <div 
              className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-rose-500/50 ring-2 ring-rose-500 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[10px] font-mono text-zinc-300 w-9 font-medium">
            {formatTime(currentDuration)}
          </span>
        </div>
      </div>

      {/* 3. Session Status & Glassmorphism Volume Pill with Gradient Fill */}
      <div className="flex items-center justify-end gap-3.5 shrink-0 max-w-[190px] sm:max-w-[240px]">
        {isSessionActive && (
          <button 
            type="button"
            onClick={onOpenSessionModal}
            className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 hover:bg-emerald-500/30 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Synced</span>
          </button>
        )}

        {/* Apple Style Glassmorphism Volume Capsule */}
        <div className="flex items-center gap-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 px-3.5 py-2 rounded-full backdrop-blur-2xl transition-all shadow-inner">
          <button 
            type="button" 
            onClick={onToggleMute} 
            className="text-zinc-200 hover:text-white transition-colors cursor-pointer shrink-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || effectiveVolume === 0 ? (
              <VolumeX size={16} className="text-rose-400" />
            ) : effectiveVolume < 0.5 ? (
              <Volume1 size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
          
          {/* Glass Volume Fill Track */}
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onVolumeChange({ target: { value: ratio } });
            }}
            className="relative w-18 sm:w-22 h-3 flex items-center cursor-pointer group"
          >
            {/* Background unfilled glass track */}
            <div className="w-full h-1.5 group-hover:h-2 rounded-full bg-white/20 overflow-hidden transition-all relative">
              {/* Active filled volume gradient */}
              <div 
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-75"
                style={{ width: `${volumePercent}%` }}
              />
            </div>

            {/* Glowing Volume Thumb Knob */}
            <div 
              className="absolute w-3 h-3 rounded-full bg-white shadow-md shadow-rose-500/40 ring-1 ring-rose-400 -translate-x-1/2 pointer-events-none transition-all"
              style={{ left: `${volumePercent}%` }}
            />
          </div>

          {/* Real-time Percentage Tag */}
          <span className="text-[10px] font-mono font-bold text-zinc-200 w-7 text-right select-none hidden xs:inline-block">
            {volumePercent}%
          </span>
        </div>
      </div>
    </footer>
  );
}
