import React, { useState, useEffect } from 'react';
import { User, Sparkles, X, Check, Loader2, AlertCircle } from 'lucide-react';

export default function NicknameModal({
  isOpen,
  onClose,
  currentName = '',
  onSaveName
}) {
  const [nickname, setNickname] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync local input whenever the modal is opened or currentName changes
  useEffect(() => {
    if (isOpen) {
      setNickname(currentName || '');
      setErrorMsg('');
      setIsSaving(false);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = nickname.trim();
    if (!clean || isSaving) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      if (typeof onSaveName === 'function') {
        const res = await onSaveName(clean);
        if (res && res.success === false) {
          setErrorMsg(res.message || 'Failed to save to database');
          setIsSaving(false);
          return;
        }
      }
      setIsSaving(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error saving nickname');
      setIsSaving(false);
    }
  };

  const quickNames = ['Vikas', 'Vikas 🎵', 'DJ Vikas', 'Rockstar', 'Viku', 'Acoustic Soul'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-zinc-950/90 border border-white/20 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-3xl flex flex-col gap-5 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center mb-3 shadow-lg ring-2 ring-white/20 text-xl font-black">
            {nickname.trim() ? nickname.trim().charAt(0).toUpperCase() : 'V'}
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Choose Your Nickname
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            This name will show on your profile and to your friends in the Jam room!
          </p>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={15} className="shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {/* Name Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
              <User size={16} />
            </div>
            <input 
              type="text"
              autoFocus
              maxLength={24}
              disabled={isSaving}
              placeholder="e.g. Vikas"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/15 focus:border-rose-500/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none backdrop-blur-xl transition-all shadow-inner disabled:opacity-60"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" /> Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setNickname(name)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.05] hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !nickname.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  <span>Saving to DB...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Name</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
