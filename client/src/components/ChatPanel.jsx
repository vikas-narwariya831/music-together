import React from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function ChatPanel({
  messages = [],
  username = '',
  newMessage = '',
  setNewMessage,
  onSendMessage,
  chatBottomRef
}) {
  return (
    <div className="flex flex-col h-full bg-zinc-950/60">
      {/* Chat Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] text-xs font-semibold text-zinc-300">
        <MessageSquare size={16} className="text-rose-400" />
        <span>Room Live Chat</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
        {messages.map((msg) => {
          const isMyMsg = msg.sender === username;
          
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="self-center my-1 px-3 py-1 rounded-full bg-white/[0.05] text-[10px] text-zinc-400 font-medium">
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isMyMsg ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {!isMyMsg && (
                <span className="text-[10px] font-bold text-rose-400 mb-0.5 ml-1">
                  {msg.sender}
                </span>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-xs break-words leading-relaxed ${
                  isMyMsg
                    ? 'bg-rose-600 text-white rounded-br-xs shadow-md shadow-rose-600/20'
                    : 'bg-zinc-800 text-zinc-200 rounded-bl-xs border border-white/5'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 px-1">
                {msg.time}
              </span>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={onSendMessage} className="p-3 border-t border-white/[0.06] flex items-center gap-2 bg-zinc-900/40">
        <input
          type="text"
          placeholder="Say something to friends..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-white/[0.06] focus:bg-white/[0.1] border border-white/10 focus:border-rose-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all"
        />
        <button
          type="submit"
          className="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-rose-600/30 cursor-pointer shrink-0"
          title="Send"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
