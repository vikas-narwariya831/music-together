import React, { useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Clock, 
  Heart, 
  MoreHorizontal,
  Flame,
  Sparkles,
  Loader2
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { detectTrackMood } from '../utils/visualizerIntelligence';

export default function SongCatalogTable({
  playlist = [],
  currentTrackIndex = 0,
  isPlaying = false,
  isBuffering = false,
  currentTime = 0,
  onSelectTrack,
  onTogglePlay,
  onOpenAddModal,
  formatTime,
  searchCategory = '',
  onQuickCategory
}) {
  const currentSong = playlist[currentTrackIndex] || playlist[0];

  // Automatically detect the mood & matching visualizer styling from track title + artist
  const moodProfile = useMemo(() => {
    if (!currentSong) return null;
    return detectTrackMood(currentSong.title || '', currentSong.artist || '');
  }, [currentSong?.title, currentSong?.artist]);

  const categories = [
    'Arijit Singh', 
    'Bollywood Top 50', 
    'Sidhu Moosewala', 
    'Diljit Dosanjh', 
    'AP Dhillon', 
    'Taylor Swift', 
    'Late Night Lo-Fi',
    'Punjabi Hits'
  ];

  return (
    <div className="flex flex-col gap-8 pb-24 w-full select-none">
      {/* 1. Fully Transparent Glassmorphism Hero Stage with AI Mood-Adaptive Visualizer */}
      {currentSong && (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-white/[0.03] p-6 md:p-8 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {/* Subtle Ambient Radial Glow that dynamically matches song emotion */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-25 transition-all duration-1000" 
            style={{ backgroundColor: moodProfile?.colors?.[0] || '#f43f5e' }}
          />
          
          {/* Audio Visualizer Engine running directly inside card background */}
          <div className="absolute inset-x-0 bottom-0 h-36 md:h-44 pointer-events-none opacity-90 z-0 overflow-hidden [mask-image:linear-gradient(to_top,black_55%,transparent_100%)]">
            <AudioVisualizer 
              isPlaying={isPlaying} 
              isBackground={true} 
              moodProfile={moodProfile}
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start lg:items-center gap-6 md:gap-8">
            {/* Pure Circular Spinning Vinyl Cassette Record + Gramophone Tonearm */}
            <div className="relative shrink-0 flex items-center justify-center py-2 pr-6 sm:pr-8">
              {/* Spinning Vinyl Cassette Record with embedded Artwork */}
              <div 
                className={`relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-full border-4 border-zinc-900/90 bg-zinc-950 shadow-[0_15px_45px_rgba(0,0,0,0.95)] flex items-center justify-center ring-2 ring-white/20 transition-all duration-700 ${
                  isPlaying || isBuffering ? 'shadow-[0_0_50px_rgba(244,63,94,0.35)] ring-white/30' : ''
                }`}
              >
                {/* Vinyl Grooves Texture - Spins on isPlaying OR isBuffering */}
                <div 
                  className={`w-full h-full rounded-full flex items-center justify-center bg-[repeating-radial-gradient(circle,#18181b_0,#18181b_4px,#27272a_5px,#09090b_8px)] p-7 sm:p-8 md:p-9 shadow-inner ${
                    isPlaying || isBuffering ? 'animate-[spin_4s_linear_infinite]' : ''
                  }`}
                >
                  {/* Embedded Circular Song Artwork inside Cassette/Vinyl */}
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-2 ring-white/30 flex items-center justify-center bg-black">
                    <img 
                      src={currentSong.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'} 
                      alt={currentSong.title} 
                      className={`w-full h-full object-cover scale-110 transition-opacity ${isBuffering ? 'opacity-80' : 'opacity-100'}`}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                      }}
                    />

                    {/* Live Loading Spinner Overlay inside Vinyl when buffering */}
                    {isBuffering && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-white drop-shadow-md" size={32} />
                      </div>
                    )}
                    
                    {/* Vinyl Center Spindle & Mood Glow Ring */}
                    <div className="absolute inset-0 m-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-950/90 border-2 border-white/50 backdrop-blur-md shadow-2xl flex items-center justify-center z-10">
                      <div 
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white/70 shadow-inner flex items-center justify-center transition-colors duration-700"
                        style={{ backgroundColor: moodProfile?.colors?.[0] || '#f43f5e' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Glass Badge */}
                <div className="absolute z-20 -bottom-2 px-3 py-1 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-white/20 text-[10px] font-bold tracking-wider text-zinc-100 flex items-center gap-1.5 shadow-xl">
                  {isBuffering ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-amber-400" />
                      <span className="text-amber-300">LOADING...</span>
                    </>
                  ) : (
                    <>
                      <span 
                        className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : 'bg-zinc-500'}`} 
                        style={{ backgroundColor: isPlaying ? (moodProfile?.colors?.[0] || '#f43f5e') : undefined }}
                      />
                      <span>{isPlaying ? 'PLAYING' : 'READY'}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Premium Glassmorphic Tonearm - 100% Theme Matched */}
              <div 
                onClick={onTogglePlay}
                title={isPlaying ? 'Click Tonearm to Pause' : 'Click Tonearm to Play'}
                className="absolute -top-3 right-0 sm:right-1 md:right-2 z-30 cursor-pointer group select-none pointer-events-auto"
              >
                {/* Arm Base Pivot / Bearing - Frosted Glass Disc */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 backdrop-blur-2xl shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex items-center justify-center ring-1 ring-white/10 relative transition-all">
                  {/* Center Pivot Gem with Mood Color */}
                  <div 
                    className="w-4 h-4 rounded-full border border-white/40 shadow-inner transition-colors duration-700 flex items-center justify-center"
                    style={{ backgroundColor: `${moodProfile?.colors?.[0] || '#f43f5e'}44` }}
                  >
                    <div 
                      className="w-1.5 h-1.5 rounded-full shadow-sm"
                      style={{ backgroundColor: moodProfile?.colors?.[0] || '#f43f5e' }}
                    />
                  </div>
                  
                  {/* Swiveling Acrylic Arm + Cartridge Head */}
                  <div 
                    className="absolute top-4 left-4 sm:top-5 sm:left-5 origin-[5px_5px] transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                      transform: isPlaying ? 'rotate(32deg)' : 'rotate(-18deg)'
                    }}
                  >
                    {/* Glassmorphic Acrylic Stylus Arm */}
                    <div className="w-2 sm:w-2.5 h-28 sm:h-32 md:h-36 bg-gradient-to-b from-white/30 via-white/10 to-white/20 backdrop-blur-xl rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.7)] border border-white/30 relative">
                      {/* Frosted Joint Ring */}
                      <div 
                        className="absolute top-10 left-[-2px] right-[-2px] h-3 rounded-full border border-white/30 transition-colors duration-700 shadow-sm"
                        style={{ backgroundColor: `${moodProfile?.colors?.[0] || '#f43f5e'}55` }}
                      />
                      
                      {/* Glass Cartridge Head */}
                      <div className="absolute bottom-[-16px] -left-2.5 w-7 sm:w-8 h-6 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 backdrop-blur-2xl border border-white/30 shadow-2xl flex flex-col items-center justify-center rotate-[-12deg] transition-all">
                        {/* Stylus Laser Glow Indicator */}
                        <div 
                          className="w-2 h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: isPlaying ? (moodProfile?.colors?.[0] || '#f43f5e') : 'rgba(255,255,255,0.2)',
                            boxShadow: isPlaying ? `0 0 12px ${moodProfile?.colors?.[0] || '#f43f5e'}, 0 0 20px ${moodProfile?.colors?.[0] || '#f43f5e'}` : 'none'
                          }}
                        />
                        {/* Stylus Needle Needle Tip */}
                        <div className="w-0.5 h-2 bg-white/70 mt-0.5 rounded-b" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Song Meta & Foreground Controls */}
            <div className="flex-1 flex flex-col items-center md:items-start min-w-0 w-full text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
                <span 
                  className="text-xs font-bold tracking-wider uppercase flex items-center gap-1 transition-colors duration-500"
                  style={{ color: moodProfile?.colors?.[0] || '#f43f5e' }}
                >
                  <Flame size={14} fill="currentColor" /> FEATURED TRACK
                </span>

                {/* Automatic Mood Detection Badge */}
                {moodProfile && (
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/10 backdrop-blur-md flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>{moodProfile.badge}</span>
                  </span>
                )}

                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/10 backdrop-blur-md">
                  Lossless Audio
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight line-clamp-2 leading-snug drop-shadow-md">
                {currentSong.title}
              </h1>
              <p className="text-sm md:text-base font-medium text-zinc-300 mt-1 mb-8">
                {currentSong.artist}
              </p>

              {/* Control Action Buttons */}
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap mt-auto">
                <button 
                  type="button"
                  onClick={onTogglePlay}
                  className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-95 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-600/30 border border-white/15 transition-all duration-200 cursor-pointer"
                >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play Music'}</span>
                </button>

                <button 
                  type="button"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-zinc-100 font-medium text-xs border border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <Plus size={15} />
                  <span>Custom URL</span>
                </button>

                <button 
                  type="button"
                  className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
                  title="Favorite"
                >
                  <Heart size={18} />
                </button>
                <button 
                  type="button"
                  className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
                  title="More Options"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Glassmorphic Genre Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          Genres:
        </span>
        {categories.map((cat) => {
          const isActive = searchCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onQuickCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer backdrop-blur-md ${
                isActive 
                  ? 'bg-white text-zinc-950 font-bold shadow-lg shadow-white/20' 
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Glassmorphic Responsive Songs Table */}
      <div className="flex flex-col rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl overflow-hidden w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]">
        {/* Table Header */}
        <div className="flex items-center px-4 md:px-6 py-3.5 border-b border-white/10 text-xs font-semibold tracking-wider text-zinc-400 uppercase bg-white/[0.02]">
          <span className="w-8 shrink-0 text-center">#</span>
          <span className="flex-1 min-w-0 ml-3">Title</span>
          <span className="w-48 sm:w-64 md:w-80 shrink-0 hidden sm:block px-3">Artist</span>
          <span className="w-16 shrink-0 text-right flex items-center justify-end"><Clock size={14} /></span>
        </div>

        {/* Track Rows */}
        <div className="divide-y divide-white/[0.04]">
          {playlist.map((track, idx) => {
            const isCurrent = idx === currentTrackIndex;
            return (
              <div
                key={track.id || idx}
                onClick={() => onSelectTrack(idx)}
                className={`flex items-center px-4 md:px-6 py-3 text-xs transition-colors cursor-pointer group ${
                  isCurrent 
                    ? 'bg-white/[0.08] text-white font-medium' 
                    : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {/* Index / Play indicator */}
                <div className="w-8 shrink-0 flex items-center justify-center text-zinc-500">
                  {isCurrent && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 h-full bg-rose-500 animate-[pulse_0.6s_ease-in-out_infinite]" />
                      <span className="w-0.5 h-2/3 bg-rose-500 animate-[pulse_0.8s_ease-in-out_infinite]" />
                      <span className="w-0.5 h-4/5 bg-rose-500 animate-[pulse_0.5s_ease-in-out_infinite]" />
                    </div>
                  ) : (
                    <span className="group-hover:hidden">{idx + 1}</span>
                  )}
                  <Play size={14} className="hidden group-hover:block text-white ml-0.5" fill="currentColor" />
                </div>

                {/* Title & Album Art */}
                <div className="flex-1 flex items-center gap-3.5 min-w-0 ml-3 pr-2">
                  <img 
                    src={track.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'} 
                    alt={track.title}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/15 shrink-0 shadow-sm" 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                    }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className={`truncate font-medium text-[13px] ${isCurrent ? 'text-rose-400 font-semibold' : 'text-zinc-100'}`}>
                      {track.title}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate sm:hidden">
                      {track.artist}
                    </span>
                  </div>
                </div>

                {/* Artist */}
                <div className="w-48 sm:w-64 md:w-80 shrink-0 hidden sm:block text-zinc-400 truncate px-3">
                  {track.artist}
                </div>

                {/* Duration */}
                <div className="w-16 shrink-0 text-right text-zinc-400 font-mono text-[11px]">
                  {formatTime(track.duration || 180)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
