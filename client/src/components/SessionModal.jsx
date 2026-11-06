import React, { useState } from 'react';
import { Users, ArrowRight, X, Radio, Copy, Check } from 'lucide-react';

export default function SessionModal({
  isOpen,
  onClose,
  username,
  setUsername,
  onJoinRoom,
  activeRooms = [],
  currentRoomId = '',
  isSessionActive = false,
  onCopyLink,
  copied = false
}) {
  const [inputRoomId, setInputRoomId] = useState('');

  if (!isOpen) return null;

  const handleStartNew = () => {
    const randomRoom = 'jam-' + Math.floor(1000 + Math.random() * 9000);
    onJoinRoom(randomRoom);
    onClose();
  };

  const handleJoinCustom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    onJoinRoom(inputRoomId.trim().toLowerCase());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950/80 border border-white/20 p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl flex flex-col gap-6 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-inner">
            <Users size={26} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Listen with Friends
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
            Start a synchronized Jam session! Friends will hear the exact same music in real-time.
          </p>
        </div>

        {/* Active room view or Join options */}
        {isSessionActive ? (
          <div className="flex flex-col items-center gap-3.5 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-xs font-medium text-rose-300">You are in Jam Room:</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider">
                {currentRoomId}
              </span>
              <button 
                onClick={onCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Send this invite link to your friends so they can join and listen along!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Create Room Option */}
            <div 
              onClick={handleStartNew}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-rose-500/30 hover:border-rose-500/60 transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                    <Radio size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Instant
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Start New Jam</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Generate a live room and invite link instantly.
                </p>
              </div>

              <div className="mt-5">
                <button 
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <span>Create Room</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Join Room Option */}
            <div className="flex flex-col justify-between p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-zinc-300">
                    <Users size={18} />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Join Jam</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter an existing room code from a friend.
                </p>
              </div>

              <form onSubmit={handleJoinCustom} className="mt-5 flex flex-col gap-2.5">
                <input 
                  type="text"
                  placeholder="e.g. jam-4029"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
