import React, { useMemo } from 'react';
import { Users } from 'lucide-react';

export default function MembersList({ members = [], currentUserId, currentSocketId }) {
  // Deduplicate members list by unique user identity (userId or socket id)
  const uniqueMembers = useMemo(() => {
    const map = new Map();
    for (const m of members) {
      const key = m.userId || m.id;
      // If duplicate exists, preserve the host entry or latest
      if (!map.has(key) || m.isHost) {
        map.set(key, m);
      }
    }
    return Array.from(map.values());
  }, [members]);

  return (
    <div className="flex flex-col h-full border-b border-white/[0.08] bg-zinc-900/30">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] text-xs font-semibold text-zinc-300">
        <Users size={16} className="text-rose-400" />
        <span>Friends in Room ({uniqueMembers.length})</span>
      </div>
      
      <div className="flex flex-col gap-1 p-3 overflow-y-auto flex-1">
        {uniqueMembers.map((m) => {
          const isMe = (currentUserId && m.userId === currentUserId) || m.id === currentSocketId;
          return (
            <div 
              key={m.userId || m.id} 
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                isMe ? 'bg-white/[0.08] text-white font-medium' : 'text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                {(m.name || 'F').charAt(0).toUpperCase()}
              </div>
              
              <span className="truncate flex-1">
                {m.name} {isMe && <span className="text-[10px] text-zinc-400 font-normal">(You)</span>}
              </span>

              {m.isHost && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Host
                </span>
              )}

              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" title="Online" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
