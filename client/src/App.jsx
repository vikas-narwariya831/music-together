import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { fetchActiveRooms, searchFullSongs, searchITunesSongs } from './api/musicApi';
import { detectTrackMood } from './utils/visualizerIntelligence';

// Components
import Header from './components/Header';
import SongCatalogTable from './components/SongCatalogTable';
import MembersList from './components/MembersList';
import ChatPanel from './components/ChatPanel';
import BottomPlayerBar from './components/BottomPlayerBar';
import SessionModal from './components/SessionModal';
import AddTrackModal from './components/AddTrackModal';
import NicknameModal from './components/NicknameModal';
import YouTubeAudioBridge from './components/YouTubeAudioBridge';

import './App.css';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'https://server-chi-liard.vercel.app';

function App() {
  const [socket, setSocket] = useState(null);

  // Auto-generate guest username or pull from localStorage (Default: Vikas)
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('musictogether_user') || 'Vikas';
  });

  // Jam Session state
  const [roomId, setRoomId] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);
  const [members, setMembers] = useState([]);

  // Music Player state
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('Arijit Singh');
  const [isSearching, setIsSearching] = useState(false);

  // Modals & Chat
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Custom MP3 song form
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytAudioBridgeRef = useRef(null);
  const isSyncingRef = useRef(false);
  const chatBottomRef = useRef(null);

  // 1. Initial Socket Connection & Auto-Join URL Room Parameter (?room=xyz)
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });
    setSocket(s);

    s.on('connect', () => {
      console.log('⚡ Connected to Music Together WebSocket server');
      refreshRoomsList();

      // Check if URL contains ?room=room-code
      const searchParams = new URLSearchParams(window.location.search);
      const urlRoom = searchParams.get('room');
      if (urlRoom && urlRoom.trim()) {
        const cleanRoom = urlRoom.trim().toLowerCase();
        console.log(`🔗 Auto-joining room from URL parameter: ${cleanRoom}`);
        setRoomId(cleanRoom);
        setIsSessionActive(true);
        s.emit('join_room', {
          roomId: cleanRoom,
          username: username
        });
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // 2. Fetch Initial Songs
  useEffect(() => {
    handleSearch('Arijit Singh');
  }, []);

  // 3. Socket event listeners for real-time room sync
  useEffect(() => {
    if (!socket) return;

    socket.on('room_sync_state', (data) => {
      console.log('Received room_sync_state:', data);
      const state = data?.room || data;
      if (state.playlist && state.playlist.length > 0) {
        setPlaylist(state.playlist);
      }
      if (typeof state.currentTrackIndex === 'number') {
        setCurrentTrackIndex(state.currentTrackIndex);
      }
      setIsPlaying(Boolean(state.isPlaying));
      const syncTime = state.liveTime !== undefined ? state.liveTime : (state.currentTime || 0);
      setCurrentTime(syncTime);

      if (ytAudioBridgeRef.current && typeof ytAudioBridgeRef.current.seekTo === 'function') {
        ytAudioBridgeRef.current.seekTo(syncTime);
      }

      if (audioRef.current) {
        isSyncingRef.current = true;
        audioRef.current.currentTime = syncTime;
        if (state.isPlaying) {
          audioRef.current.play().catch(console.error);
        } else {
          audioRef.current.pause();
        }
        setTimeout(() => { isSyncingRef.current = false; }, 300);
      }
    });

    socket.on('members_updated', (updatedMembers) => {
      setMembers(updatedMembers);
    });

    socket.on('sync_play_state', ({ currentTime: time }) => {
      setIsPlaying(true);
      setCurrentTime(time);
      if (ytAudioBridgeRef.current && typeof ytAudioBridgeRef.current.seekTo === 'function') {
        ytAudioBridgeRef.current.seekTo(time);
      }
      if (audioRef.current) {
        isSyncingRef.current = true;
        audioRef.current.currentTime = time;
        audioRef.current.play().catch(console.error);
        setTimeout(() => { isSyncingRef.current = false; }, 300);
      }
    });

    socket.on('sync_pause_state', ({ currentTime: time }) => {
      setIsPlaying(false);
      setCurrentTime(time);
      if (audioRef.current) {
        isSyncingRef.current = true;
        audioRef.current.currentTime = time;
        audioRef.current.pause();
        setTimeout(() => { isSyncingRef.current = false; }, 300);
      }
    });

    socket.on('sync_seek_state', ({ currentTime: time }) => {
      setCurrentTime(time);
      if (ytAudioBridgeRef.current && typeof ytAudioBridgeRef.current.seekTo === 'function') {
        ytAudioBridgeRef.current.seekTo(time);
      }
      if (audioRef.current) {
        isSyncingRef.current = true;
        audioRef.current.currentTime = time;
        setTimeout(() => { isSyncingRef.current = false; }, 300);
      }
    });

    socket.on('track_changed', ({ currentTrackIndex: idx, isPlaying: playing, currentTime: time }) => {
      console.log('⚡ Socket track_changed received:', idx);
      setCurrentTrackIndex(idx);
      setIsPlaying(playing);
      setCurrentTime(time || 0);
      if (ytAudioBridgeRef.current && typeof ytAudioBridgeRef.current.seekTo === 'function') {
        ytAudioBridgeRef.current.seekTo(time || 0);
        if (playing && typeof ytAudioBridgeRef.current.play === 'function') {
          ytAudioBridgeRef.current.play();
        }
      }
      if (audioRef.current) {
        isSyncingRef.current = true;
        audioRef.current.currentTime = time || 0;
        if (playing) {
          audioRef.current.play().catch(console.error);
        } else {
          audioRef.current.pause();
        }
        setTimeout(() => { isSyncingRef.current = false; }, 300);
      }
    });

    socket.on('playlist_updated', (newPlaylist) => {
      setPlaylist(newPlaylist);
    });

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => {
      socket.off('room_sync_state');
      socket.off('members_updated');
      socket.off('sync_play_state');
      socket.off('sync_pause_state');
      socket.off('sync_seek_state');
      socket.off('track_changed');
      socket.off('playlist_updated');
      socket.off('new_message');
    };
  }, [socket]);

  const refreshRoomsList = async () => {
    const rooms = await fetchActiveRooms();
    setActiveRooms(rooms);
  };

  const copyInviteLink = () => {
    if (!roomId) return;
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoinJamRoom = (targetRoomId) => {
    const cleanRoom = targetRoomId.trim().toLowerCase();
    setRoomId(cleanRoom);
    setIsSessionActive(true);
    if (socket) {
      socket.emit('join_room', {
        roomId: cleanRoom,
        username: username
      });
    }
    // Auto-copy invite link to clipboard immediately upon creating/joining room!
    const url = `${window.location.origin}/?room=${cleanRoom}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const leaveJamSession = () => {
    setIsSessionActive(false);
    setRoomId('');
    setMembers([]);
    setMessages([]);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const togglePlay = () => {
    const nextState = !isPlaying;
    const currentSong = playlist[currentTrackIndex];

    // 1. YouTube Song Play/Pause
    if (currentSong?.isYouTube) {
      if (ytAudioBridgeRef.current) {
        if (nextState && typeof ytAudioBridgeRef.current.play === 'function') {
          ytAudioBridgeRef.current.play();
        } else if (!nextState && typeof ytAudioBridgeRef.current.pause === 'function') {
          ytAudioBridgeRef.current.pause();
        }
      }
      setIsPlaying(nextState);
    } 
    // 2. Native MP3 Audio Play/Pause
    else if (audioRef.current && currentSong?.src) {
      if (nextState) {
        if (!audioRef.current.src || audioRef.current.src !== currentSong?.src) {
          audioRef.current.src = currentSong.src;
          audioRef.current.load();
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn('Audio play error:', err);
          setIsPlaying(true);
        });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(nextState);
    }

    if (isSessionActive && socket) {
      const syncTime = currentTime;
      if (nextState) {
        socket.emit('sync_play', { roomId, currentTime: syncTime });
      } else {
        socket.emit('sync_pause', { roomId, currentTime: syncTime });
      }
    }
  };

  const handleSelectTrack = (index) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    const track = playlist[index];
    if (track?.duration) setDuration(track.duration);

    if (track?.isYouTube) {
      setIsPlaying(true);
      if (ytAudioBridgeRef.current && typeof ytAudioBridgeRef.current.seekTo === 'function') {
        ytAudioBridgeRef.current.seekTo(0);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else if (audioRef.current && track?.src) {
      audioRef.current.currentTime = 0;
      audioRef.current.src = track.src;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Audio play on track select:', err);
        setIsPlaying(true);
      });
    } else {
      setIsPlaying(true);
    }

    if (isSessionActive && socket) {
      socket.emit('sync_change_track', { 
        roomId, 
        trackIndex: index,
        playlist: playlist 
      });
    }
  };

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    handleSelectTrack(nextIndex);
  };

  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    handleSelectTrack(prevIndex);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (ytAudioBridgeRef.current && typeof ytAudioBridgeRef.current.seekTo === 'function') {
      ytAudioBridgeRef.current.seekTo(newTime);
    }
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    if (isSessionActive && socket) {
      socket.emit('sync_seek', { roomId, currentTime: newTime });
    }
  };

  const handleSearch = (query) => {
    setSearchCategory('');
    executeSearch(query);
  };

  const handleQuickCategory = (cat) => {
    setSearchCategory(cat);
    setSearchQuery(cat);
    executeSearch(cat);
  };

  const executeSearch = async (query) => {
    if (!query || !query.trim()) return;
    setIsSearching(true);
    try {
      // 1. First fetch full songs from primary backend engine
      let results = await searchFullSongs(query.trim());
      
      // 2. If backend yielded empty, automatically fallback to iTunes
      if (!results || results.length === 0) {
        console.log('Falling back to iTunes preview search...');
        results = await searchITunesSongs(query.trim(), 25);
      }

      if (results && results.length > 0) {
        setPlaylist(results);
        setCurrentTrackIndex(0);
        setCurrentTime(0);
        if (results[0]?.duration) {
          setDuration(results[0].duration);
        }

        // If in an active Jam session, sync the entire new searched playlist & track 0 with everyone in the room!
        if (isSessionActive && socket && roomId) {
          socket.emit('sync_change_track', {
            roomId,
            trackIndex: 0,
            playlist: results
          });
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 30);
    }
  };

  const onEnded = () => {
    handleNextTrack();
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleUpdateNickname = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem('musictogether_user', trimmed);
    if (socket && isSessionActive && roomId) {
      socket.emit('update_nickname', {
        roomId,
        username: trimmed
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !roomId) return;
    socket.emit('send_message', {
      roomId,
      message: newMessage.trim(),
      username
    });
    setNewMessage('');
  };

  const handleAddCustomTrack = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const newSong = {
      id: 'custom-' + Date.now(),
      title: customTitle.trim() || 'Custom Track',
      artist: customArtist.trim() || username,
      src: customUrl.trim(),
      duration: 180,
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80'
    };

    if (isSessionActive && socket) {
      socket.emit('add_track', { roomId, username, track: newSong });
    } else {
      setPlaylist(prev => [newSong, ...prev]);
      setCurrentTrackIndex(0);
      handleSelectTrack(0);
    }

    setCustomTitle('');
    setCustomArtist('');
    setCustomUrl('');
    setShowAddModal(false);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTrack = (playlist && playlist[currentTrackIndex]) || playlist[0] || {
    title: 'Loading songs...',
    artist: 'MusicTogether Live',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    src: ''
  };

  // Dynamic Mood Profile & Color theme calculated dynamically for entire UI Glassmorphism
  const currentMoodProfile = useMemo(() => {
    return detectTrackMood(currentTrack?.title || '', currentTrack?.artist || '');
  }, [currentTrack?.title, currentTrack?.artist]);

  const ambientGlows = currentMoodProfile?.ambientGlows || {
    primary: 'from-rose-600/35 via-purple-600/25 to-transparent',
    secondary: 'from-indigo-600/30 via-cyan-600/20 to-transparent',
    accent: 'from-violet-600/20 to-rose-950/15'
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative selection:bg-rose-500 selection:text-white transition-colors duration-1000">
      {/* Dynamic Mood-Adaptive Ambient Glassmorphism Backdrops (Changes live per song vibe) */}
      <div 
        className={`fixed top-[-15%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-br ${ambientGlows.primary} blur-[140px] pointer-events-none transition-all duration-1000 animate-pulse`} 
        style={{ animationDuration: isPlaying ? '4s' : '8s' }}
      />
      <div 
        className={`fixed bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl ${ambientGlows.secondary} blur-[160px] pointer-events-none transition-all duration-1000`} 
      />
      <div 
        className={`fixed top-[35%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr ${ambientGlows.accent} blur-[150px] pointer-events-none transition-all duration-1000 opacity-60`} 
      />

      {/* 100% Reliable Native Audio Element for Direct MP3 streams */}
      <audio
        ref={audioRef}
        src={!currentTrack?.isYouTube ? currentTrack?.src : undefined}
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={onEnded}
      />

      {/* Official YouTube Audio Bridge: Plays full length songs without showing video */}
      {currentTrack?.isYouTube && currentTrack?.videoId && (
        <YouTubeAudioBridge
          ref={ytAudioBridgeRef}
          videoId={currentTrack.videoId}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onProgress={(curr) => setCurrentTime(curr)}
          onDuration={(dur) => setDuration(dur)}
          onEnded={handleNextTrack}
          onBuffering={(buf) => setIsBuffering(buf)}
          onError={(errCode) => {
            console.warn(`YouTube stream error ${errCode} on ${currentTrack.title}. Auto-skipping to next playable track...`);
            handleNextTrack();
          }}
        />
      )}

      {/* Top Header */}
      <Header
        username={username}
        setUsername={setUsername}
        isSessionActive={isSessionActive}
        roomId={roomId}
        members={members}
        copied={copied}
        onCopyLink={copyInviteLink}
        onOpenSessionModal={() => setShowSessionModal(true)}
        onLeaveSession={leaveJamSession}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        isSearching={isSearching}
        onToggleMobileSidebar={() => setShowMobileSidebar(prev => !prev)}
        showMobileSidebar={showMobileSidebar}
        moodProfile={currentMoodProfile}
        onOpenNicknameModal={() => setShowNicknameModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
          <SongCatalogTable
            playlist={playlist}
            currentTrackIndex={currentTrackIndex}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            isSearching={isSearching}
            currentTime={currentTime}
            onSelectTrack={handleSelectTrack}
            onTogglePlay={togglePlay}
            onOpenAddModal={() => setShowAddModal(true)}
            formatTime={formatTime}
            audioRef={audioRef}
            ytPlayerRef={ytPlayerRef}
            searchCategory={searchCategory}
            onQuickCategory={handleQuickCategory}
          />
        </main>

        {/* Right Side: In-Room Friends & Live Chat (Glassmorphic Drawer) */}
        {isSessionActive && (
          <aside className={`
            fixed md:static inset-y-0 right-0 z-30 w-full sm:w-80 md:w-80 shrink-0 border-l border-white/10 bg-zinc-950/80 md:bg-white/[0.03] backdrop-blur-3xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-2xl
            ${showMobileSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}>
            {/* Mobile close bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.04]">
              <span className="text-xs font-bold text-white tracking-wide">Jam Room Controls</span>
              <button 
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="h-56 sm:h-64 shrink-0 overflow-hidden">
              <MembersList
                members={members}
                currentSocketId={socket?.id}
              />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatPanel
                messages={messages}
                username={username}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                chatBottomRef={chatBottomRef}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Sticky Bottom Music Controller */}
      <BottomPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        formatTime={formatTime}
        onTogglePlay={togglePlay}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        isSessionActive={isSessionActive}
        onOpenSessionModal={() => setShowSessionModal(true)}
      />

      {/* SharePlay Jam Modal */}
      <SessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        username={username}
        setUsername={setUsername}
        onJoinRoom={handleJoinJamRoom}
        activeRooms={activeRooms}
        currentRoomId={roomId}
        isSessionActive={isSessionActive}
        onCopyLink={copyInviteLink}
        copied={copied}
      />

      {/* Custom Song Modal */}
      <AddTrackModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        customTitle={customTitle}
        setCustomTitle={setCustomTitle}
        customArtist={customArtist}
        setCustomArtist={setCustomArtist}
        customUrl={customUrl}
        setCustomUrl={setCustomUrl}
        onAddTrack={handleAddCustomTrack}
      />

      {/* Nickname Selection Glass Modal */}
      <NicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        currentName={username}
        onSaveName={handleUpdateNickname}
      />
    </div>
  );
}

export default App;
