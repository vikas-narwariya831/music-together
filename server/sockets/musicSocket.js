const { rooms, DEFAULT_TRACKS, getLivePlaybackTime } = require('../data/roomsStore');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] User ID: ${socket.id}`);

    // Join room
    socket.on('join_room', ({ roomId, username }) => {
      if (!roomId || !username) return;

      const normalizedRoomId = roomId.toLowerCase().trim();
      socket.join(normalizedRoomId);

      let room = rooms.get(normalizedRoomId);
      if (!room) {
        room = {
          id: normalizedRoomId,
          hostId: socket.id,
          members: [],
          playlist: [...DEFAULT_TRACKS],
          currentTrackIndex: 0,
          isPlaying: false,
          currentTime: 0,
          lastUpdated: Date.now(),
          messages: []
        };
        rooms.set(normalizedRoomId, room);
      }

      // Add or update member
      const existingIdx = room.members.findIndex(m => m.id === socket.id);
      const memberObj = {
        id: socket.id,
        name: username,
        isHost: room.hostId === socket.id
      };

      if (existingIdx !== -1) {
        room.members[existingIdx] = memberObj;
      } else {
        room.members.push(memberObj);
      }

      const joinMsg = {
        id: Date.now() + Math.random().toString(),
        sender: 'System',
        text: `${username} joined the music room! 🎧`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      room.messages.push(joinMsg);

      // Send initial room state to the user who joined
      socket.emit('room_sync_state', {
        room: {
          ...room,
          liveTime: getLivePlaybackTime(room)
        }
      });

      // Broadcast updated member list and system join message
      io.to(normalizedRoomId).emit('members_updated', room.members);
      io.to(normalizedRoomId).emit('new_message', joinMsg);
    });

    // Play/Resume Sync
    socket.on('sync_play', ({ roomId, currentTime }) => {
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      room.isPlaying = true;
      room.currentTime = currentTime || 0;
      room.lastUpdated = Date.now();

      io.to(room.id).emit('sync_play_state', {
        isPlaying: true,
        currentTime: room.currentTime,
        timestamp: room.lastUpdated
      });
    });

    // Pause Sync
    socket.on('sync_pause', ({ roomId, currentTime }) => {
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      room.isPlaying = false;
      room.currentTime = currentTime;
      room.lastUpdated = Date.now();

      io.to(room.id).emit('sync_pause_state', {
        isPlaying: false,
        currentTime: room.currentTime
      });
    });

    // Seek Sync
    socket.on('sync_seek', ({ roomId, currentTime }) => {
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      room.currentTime = currentTime;
      room.lastUpdated = Date.now();

      io.to(room.id).emit('sync_seek_state', {
        currentTime: room.currentTime,
        isPlaying: room.isPlaying
      });
    });

    // Change Track
    socket.on('sync_change_track', ({ roomId, trackIndex, playlist }) => {
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      if (playlist && Array.isArray(playlist) && playlist.length > 0) {
        room.playlist = playlist;
        io.to(room.id).emit('playlist_updated', room.playlist);
      }

      if (trackIndex >= 0 && trackIndex < room.playlist.length) {
        room.currentTrackIndex = trackIndex;
        room.currentTime = 0;
        room.isPlaying = true;
        room.lastUpdated = Date.now();

        io.to(room.id).emit('track_changed', {
          currentTrackIndex: room.currentTrackIndex,
          isPlaying: room.isPlaying,
          currentTime: 0
        });
      }
    });

    // Add Track to Queue
    socket.on('add_track', ({ roomId, track, username }) => {
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      const newTrack = {
        id: 'track-' + Date.now(),
        title: track.title || 'Custom Track',
        artist: track.artist || username || 'Unknown Artist',
        src: track.src,
        duration: track.duration || 0,
        cover: track.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80'
      };

      room.playlist.push(newTrack);
      io.to(room.id).emit('playlist_updated', room.playlist);

      const alertMsg = {
        id: Date.now() + Math.random().toString(),
        sender: 'System',
        text: `${username} queued "${newTrack.title}" 🎵`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      room.messages.push(alertMsg);
      io.to(room.id).emit('new_message', alertMsg);
    });

    // Update nickname & broadcast to everyone in the room
    socket.on('update_nickname', ({ roomId, username }) => {
      if (!roomId || !username) return;
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      const member = room.members.find(m => m.id === socket.id);
      if (member) {
        const oldName = member.name;
        member.name = username.trim();

        const renameMsg = {
          id: Date.now() + Math.random().toString(),
          sender: 'System',
          text: `"${oldName}" is now "${member.name}" 🏷️`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        room.messages.push(renameMsg);
        io.to(room.id).emit('new_message', renameMsg);
        io.to(room.id).emit('members_updated', room.members);
      }
    });

    // Chat Message
    socket.on('send_message', ({ roomId, message, username }) => {
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      const chatMsg = {
        id: Date.now() + Math.random().toString(),
        sender: username,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false
      };

      room.messages.push(chatMsg);
      io.to(room.id).emit('new_message', chatMsg);
    });

    // Explicit Leave Room Event
    socket.on('leave_room', ({ roomId }) => {
      if (!roomId) return;
      const normalizedRoomId = roomId.toLowerCase().trim();
      const room = rooms.get(normalizedRoomId);
      if (!room) return;

      const idx = room.members.findIndex(m => m.id === socket.id);
      if (idx !== -1) {
        const leavingMember = room.members[idx];
        const wasHost = room.hostId === socket.id;

        socket.leave(normalizedRoomId);

        // If HOST leaves the room, destroy the room completely and dismiss everyone!
        if (wasHost) {
          console.log(`[Host Left] Room destroyed: ${normalizedRoomId}`);
          io.to(normalizedRoomId).emit('room_closed', {
            message: `Host (${leavingMember.name}) has ended the Jam Room. Session closed.`
          });
          rooms.delete(normalizedRoomId);
          return;
        }

        // If ordinary member leaves:
        room.members.splice(idx, 1);
        const leaveMsg = {
          id: Date.now() + Math.random().toString(),
          sender: 'System',
          text: `${leavingMember.name} left the room.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        room.messages.push(leaveMsg);
        io.to(normalizedRoomId).emit('new_message', leaveMsg);
        io.to(normalizedRoomId).emit('members_updated', room.members);

        if (room.members.length === 0) {
          rooms.delete(normalizedRoomId);
        }
      }
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] User ID: ${socket.id}`);
      rooms.forEach((room, roomId) => {
        const idx = room.members.findIndex(m => m.id === socket.id);
        if (idx !== -1) {
          const leavingMember = room.members[idx];
          const wasHost = room.hostId === socket.id;

          // If HOST disconnects / closes tab, notify all and terminate the room!
          if (wasHost) {
            console.log(`[Host Disconnected] Terminating room: ${roomId}`);
            io.to(roomId).emit('room_closed', {
              message: `Host (${leavingMember.name}) disconnected. Jam room closed.`
            });
            rooms.delete(roomId);
            return;
          }

          room.members.splice(idx, 1);
          const leaveMsg = {
            id: Date.now() + Math.random().toString(),
            sender: 'System',
            text: `${leavingMember.name} left the room.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
          };
          room.messages.push(leaveMsg);
          io.to(roomId).emit('new_message', leaveMsg);
          io.to(roomId).emit('members_updated', room.members);

          if (room.members.length === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });
}

module.exports = { registerSocketHandlers };
