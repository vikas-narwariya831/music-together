const { rooms, DEFAULT_TRACKS, getLivePlaybackTime } = require('../data/roomsStore');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] User ID: ${socket.id}`);

    // Join room
    socket.on('join_room', ({ roomId, username, userId }) => {
      if (!roomId || !username) return;

      const normalizedRoomId = roomId.toLowerCase().trim();
      const uid = userId || socket.id;
      socket.join(normalizedRoomId);

      let room = rooms.get(normalizedRoomId);
      if (!room) {
        room = {
          id: normalizedRoomId,
          hostUserId: uid,
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

      // Check if this user (by userId or socket.id) already exists in room!
      const existingIdx = room.members.findIndex(m => 
        (m.userId && m.userId === uid) || m.id === socket.id
      );

      // Check if this user is the room host
      const isHost = room.hostUserId === uid || room.hostId === socket.id;
      if (isHost) {
        room.hostUserId = uid;
        room.hostId = socket.id;
      }

      const memberObj = {
        id: socket.id,
        userId: uid,
        name: username,
        isHost: isHost
      };

      if (existingIdx !== -1) {
        // User reconnecting or updating nickname: update in place without duplication!
        room.members[existingIdx] = memberObj;
      } else {
        room.members.push(memberObj);

        const joinMsg = {
          id: Date.now() + Math.random().toString(),
          sender: 'System',
          text: `${username} joined the music room! 🎧`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        room.messages.push(joinMsg);
        io.to(normalizedRoomId).emit('new_message', joinMsg);
      }

      // Send initial room state to the user who joined
      socket.emit('room_sync_state', {
        room: {
          ...room,
          liveTime: getLivePlaybackTime(room)
        }
      });

      // Broadcast updated member list (never contains duplicates)
      io.to(normalizedRoomId).emit('members_updated', room.members);
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
    socket.on('update_nickname', ({ roomId, username, userId }) => {
      if (!roomId || !username) return;
      const room = rooms.get(roomId?.toLowerCase());
      if (!room) return;

      const uid = userId || socket.id;
      const member = room.members.find(m => (m.userId && m.userId === uid) || m.id === socket.id);
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

    // Explicit Leave Room Event (Host explicitly clicking Leave Jam)
    socket.on('leave_room', ({ roomId, userId }) => {
      if (!roomId) return;
      const normalizedRoomId = roomId.toLowerCase().trim();
      const room = rooms.get(normalizedRoomId);
      if (!room) return;

      const uid = userId || socket.id;
      const idx = room.members.findIndex(m => (m.userId && m.userId === uid) || m.id === socket.id);
      if (idx !== -1) {
        const leavingMember = room.members[idx];
        const wasHost = leavingMember.isHost || room.hostUserId === uid || room.hostId === socket.id;

        socket.leave(normalizedRoomId);

        // If HOST explicitly leaves the room, destroy the room completely and dismiss everyone!
        if (wasHost) {
          console.log(`[Host Left] Room destroyed: ${normalizedRoomId}`);
          io.to(normalizedRoomId).emit('room_closed', {
            message: `Host (${leavingMember.name}) has ended the Jam Room. Session closed.`
          });
          io.in(normalizedRoomId).socketsLeave(normalizedRoomId);
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

    // Disconnect Handler (Handles accidental drops, reloads, and stale polling sockets)
    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] User ID: ${socket.id}`);
      rooms.forEach((room, roomId) => {
        const idx = room.members.findIndex(m => m.id === socket.id);
        if (idx !== -1) {
          const leavingMember = room.members[idx];

          // If the user already reconnected on another socket (page refresh / transport switch), ignore!
          if (room.members[idx].id !== socket.id) {
            return;
          }

          // If HOST disconnects (could be quick F5 refresh), give a 10s grace period before tearing down
          if (leavingMember.isHost) {
            console.log(`[Host Disconnected] Waiting 10s grace period for host reconnect: ${roomId}`);
            setTimeout(() => {
              const currentRoom = rooms.get(roomId);
              if (!currentRoom) return;

              // Check if host reconnected with same userId or socket
              const hostReconnected = currentRoom.members.some(m => 
                (m.userId && m.userId === leavingMember.userId && m.id !== socket.id) ||
                (currentRoom.hostUserId === leavingMember.userId && currentRoom.hostId !== socket.id)
              );

              if (!hostReconnected) {
                console.log(`[Host Grace Expired] Terminating room: ${roomId}`);
                io.to(roomId).emit('room_closed', {
                  message: `Host (${leavingMember.name}) disconnected. Jam room closed.`
                });
                io.in(roomId).socketsLeave(roomId);
                rooms.delete(roomId);
              } else {
                console.log(`[Host Grace] Host safely reconnected to ${roomId}`);
              }
            }, 10000);
            return;
          }

          // Ordinary member disconnected:
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
