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
  username = 'Vikas', 
  setUsername, 
  isSessionActive = false, 
  isSocketConnected = false,
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
  moodProfile,
  onOpenNicknameModal
}) {
  const safeName = username || 'Vikas';
  const initial = safeName.trim() ? safeName.trim().charAt(0).toUpperCase() : 'V';

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
    <header className="h-14 sm:h-16 px-3 sm:px-6 md:px-8 shrink-0 flex items-center justify-between gap-2 sm:gap-4 border-b border-white/[0.12] bg-white/[0.03] backdrop-blur-3xl z-40 select-none shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-700">
      {/* 1. Left: Brand Logo & Title with Live Socket Online Dot */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div 
          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20 shrink-0 transition-all duration-700"
          style={{ background: brandGradient || 'linear-gradient(135deg, #f43f5e, #fb7185)' }}
        >
          <Disc3 className="text-white animate-[spin_8s_linear_infinite]" size={18} />
          {/* Live Socket Status Dot */}
          <span 
            className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 transition-colors ${
              isSocketConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
            }`} 
            title={isSocketConnected ? 'Online (Real-time Sync Active)' : 'Connecting...'}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
            MusicTogether
          </span>
          <span 
            className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md hidden xs:inline-block shadow-sm transition-colors duration-700"
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
      <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-4">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full group">
          <button 
            type="submit" 
            className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 group-focus-within:text-white hover:text-rose-400 transition-colors cursor-pointer"
            title="Search"
          >
            <Search size={14} className="sm:w-4 sm:h-4" />
          </button>

          <input
            type="text"
            placeholder="Search songs... (Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 sm:h-10 pl-8 sm:pl-10 pr-7 sm:pr-9 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-full text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 outline-none backdrop-blur-2xl transition-all duration-300 shadow-inner"
          />

          {isSearching ? (
            <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3.5 flex items-center pointer-events-none text-rose-400">
              <Loader2 size={14} className="animate-spin" />
            </div>
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSearch('Arijit Singh');
              }}
              className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              title="Clear"
            >
              ✕
            </button>
          ) : null}
        </form>
      </div>

      {/* 3. Right: Jam Session Controls & Glass Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Chat Drawer Toggle */}
        {isSessionActive && (
          <button 
            type="button"
            onClick={onToggleMobileSidebar}
            className={`md:hidden p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 ${
              showMobileSidebar 
                ? 'bg-rose-600 text-white border-rose-500' 
                : 'bg-white/10 text-zinc-200 border-white/10 hover:bg-white/15'
            }`}
            title="Toggle Room Chat & Members"
          >
            <MessageSquare size={15} />
            {members.length > 0 && (
              <span className="text-[10px] font-bold px-1 rounded-full bg-white/20">
                {members.length}
              </span>
            )}
          </button>
        )}

        {/* SharePlay / Jam Status with Interactive Copy Indicator */}
        {isSessionActive ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-lg relative">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 font-mono tracking-wide">
              {roomId}
            </span>

            {/* Share / Copy Button with Cursor Pointer */}
            <button 
              type="button"
              onClick={onCopyLink}
              className="p-1 rounded-full hover:bg-white/10 active:scale-95 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              title="Copy Room Link to Invite Friends"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300 sm:inline hidden animate-in fade-in">
                    Copied!
                  </span>
                </>
              ) : (
                <Share2 size={13} className="hover:scale-110 transition-transform" />
              )}
            </button>

            <button
              type="button"
              onClick={onLeaveSession}
              className="text-[10px] sm:text-xs font-medium text-rose-400 hover:text-rose-300 hover:underline px-0.5 sm:px-1 transition-colors cursor-pointer"
              title="Leave this Jam Room"
            >
              Leave
            </button>

            {/* Floating Toast Message when Copied */}
            {copied && (
              <div className="absolute top-11 sm:top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl bg-zinc-900/95 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-[11px] font-bold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 flex items-center gap-1.5 ring-1 ring-emerald-500/20">
                <Check size={12} className="text-emerald-400" />
                <span>Link Copied! 🎉</span>
              </div>
            )}
          </div>
        ) : (
          <button 
            type="button"
            onClick={onOpenSessionModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-95 text-white text-[11px] sm:text-xs font-semibold shadow-lg shadow-rose-600/30 border border-white/15 transition-all duration-200 cursor-pointer"
          >
            <Users size={13} className="shrink-0" />
            <span className="whitespace-nowrap hidden xs:inline">Jam</span>
            <span className="whitespace-nowrap hidden sm:inline">Session</span>
          </button>
        )}

        {/* User Glass Avatar & Name (Click to open Nickname Modal) */}
        <div 
          onClick={onOpenNicknameModal}
          title="Click to change your nickname"
          className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2.5 border-l border-white/10 cursor-pointer group hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shadow-md ring-1 ring-white/20 shrink-0 group-hover:scale-105 transition-transform">
            {initial}
          </div>
          <div className="flex items-center gap-1 hidden md:flex">
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate max-w-[80px] lg:max-w-[110px]">
              {username || 'Vikas'}
            </span>
            <span className="text-[10px] text-zinc-500 group-hover:text-rose-400 transition-colors">
              ✏️
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
