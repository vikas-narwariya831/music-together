import React from 'react';
import { 
  Users, 
  Share2, 
  Check, 
  Search, 
  Loader2, 
  Disc3,
  MessageSquare
} from 'lucide-react';

export default function Header({ 
  username = 'Listener', 
  setUsername, 
  isSessionActive = false, 
  roomId = '', 
  members = [], 
  copied = false, 
  onCopyLink,
  onOpenSessionModal,
  onLeaveSession,
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
  onToggleMobileSidebar,
  showMobileSidebar,
  moodProfile
}) {
  const safeName = username || 'Listener';
  const initial = safeName.trim() ? safeName.trim().charAt(0).toUpperCase() : 'U';

  const brandGradient = moodProfile?.colors ? 
    `linear-gradient(135deg, ${moodProfile.colors[0]}, ${moodProfile.colors[1] || moodProfile.colors[0]})` : 
    undefined;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 shrink-0 flex items-center justify-between gap-4 border-b border-white/[0.12] bg-white/[0.03] backdrop-blur-3xl z-40 select-none shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-700">
      {/* 1. Left: Brand Logo & Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20 shrink-0 transition-all duration-700"
          style={{ background: brandGradient || 'linear-gradient(135deg, #f43f5e, #fb7185)' }}
        >
          <Disc3 className="text-white animate-[spin_8s_linear_infinite]" size={20} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            MusicTogether
          </span>
          <span 
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md hidden sm:inline-block shadow-sm transition-colors duration-700"
            style={{ 
              backgroundColor: `${moodProfile?.colors?.[0] || '#f43f5e'}22`, 
              color: moodProfile?.colors?.[0] || '#f43f5e' 
            }}
          >
            {moodProfile?.badge || 'PRO'}
          </span>
        </div>
      </div>

      {/* 2. Center: Translucent Glassmorphism Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full group">
          <button 
            type="submit" 
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 group-focus-within:text-white hover:text-rose-400 transition-colors cursor-pointer"
            title="Search"
          >
            <Search size={16} />
          </button>

          <input
            type="text"
            placeholder="Search artists, songs, playlists... (Press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-10 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-full text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 outline-none backdrop-blur-2xl transition-all duration-300 shadow-inner"
          />

          {isSearching ? (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-rose-400">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSearch('Arijit Singh');
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              title="Clear"
            >
              ✕
            </button>
          ) : null}
        </form>
      </div>

      {/* 3. Right: Jam Session Controls & Glass Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Chat Drawer Toggle */}
        {isSessionActive && (
          <button 
            type="button"
            onClick={onToggleMobileSidebar}
            className={`md:hidden p-2 rounded-xl border transition-colors ${
              showMobileSidebar 
                ? 'bg-rose-600 text-white border-rose-500' 
                : 'bg-white/10 text-zinc-200 border-white/10 hover:bg-white/15'
            }`}
            title="Toggle Room Chat"
          >
            <MessageSquare size={16} />
          </button>
        )}

        {/* SharePlay / Jam Status */}
        {isSessionActive ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-emerald-300 font-mono tracking-wide">
              {roomId}
            </span>
            <button 
              type="button"
              onClick={onCopyLink}
              className="p-1 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Copy Room Link"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            </button>
            <button
              type="button"
              onClick={onLeaveSession}
              className="text-xs font-medium text-rose-400 hover:underline px-1 transition-colors"
            >
              Leave
            </button>
          </div>
        ) : (
          <button 
            type="button"
            onClick={onOpenSessionModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 border border-white/15 transition-all duration-200 cursor-pointer"
          >
            <Users size={15} className="shrink-0" />
            <span className="whitespace-nowrap">SharePlay Jam</span>
          </button>
        )}

        {/* User Glass Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-md ring-1 ring-white/20 shrink-0">
            {initial}
          </div>
          <input
            type="text"
            className="w-20 bg-transparent text-xs font-semibold text-zinc-200 hover:text-white focus:text-white outline-none cursor-pointer hover:bg-white/5 focus:bg-white/10 rounded px-1.5 py-0.5 transition-colors hidden sm:block"
            value={username || ''}
            onChange={(e) => setUsername && setUsername(e.target.value)}
            title="Click to edit display name"
          />
        </div>
      </div>
    </header>
  );
}
