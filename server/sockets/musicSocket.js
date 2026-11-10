const { rooms, DEFAULT_TRACKS, getLivePlaybackTime } = require('../data/roomsStore');
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Resolves a unique username in a room by appending (2), (3) etc.
 * if another user in the room already has the same name.
 */
function resolveUniqueUsername(requestedName, uid, members) {
  const base = (requestedName || 'Friend').trim();
  const otherMembers = (members || []).filter(m => m.userId && m.userId !== uid);
  const takenNames = new Set(otherMembers.map(m => (m.name || '').toLowerCase()));

  if (!takenNames.has(base.toLowerCase())) {
    return base;
  }

  let counter = 2;
  while (takenNames.has(`${base} (${counter})`.toLowerCase())) {
    counter++;
  }
  return `${base} (${counter})`;
}

function registerSocketHandlers(io, MAX_ROOM_SIZE = 20) {
  // 1. Connection Authentication Middleware: reads userId and username at handshake!
  io.use(async (socket, next) => {
    try {
      const auth = socket.handshake.auth || {};
      const query = socket.handshake.query || {};
      const uid = auth.userId || query.userId || ('usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));
      const uname = (auth.username || query.username || 'Vikas').trim();

      socket.userId = uid;
      socket.username = uname;

      // Persist or update user in MongoDB Atlas right at connection
      User.findOneAndUpdate(
        { userId: uid },
        { username: uname, lastSeen: new Date() },
        { upsert: true, returnDocument: 'after' }
      ).catch((err) => console.warn('[MongoDB User Handshake Error]:', err.message));

      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] Socket ID: ${socket.id} | User: ${socket.username} (UID: ${socket.userId})`);

    // Acknowledge session to client immediately with confirmed userId
    socket.emit('session_ready', {
      userId: socket.userId,
      username: socket.username
    });

    // Verify user identity & fetch/save in MongoDB on socket connection
    socket.on('check_user', async ({ userId, username }) => {
      const uid = userId || socket.userId || ('usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));
      let finalName = (username || socket.username || 'Vikas').trim();

      try {
        const existing = await User.findOne({ userId: uid });
        if (existing && existing.username) {
          finalName = existing.username;
          existing.lastSeen = new Date();
          await existing.save();
        } else {
          await User.create({
            userId: uid,
            username: finalName
          });
        }
      } catch (err) {
        console.warn('[User Check Error]:', err.message);
      }

      socket.userId = uid;
      socket.username = finalName;

      socket.emit('user_verified', {
        userId: uid,
        username: finalName
      });
    });

    // Save profile directly from NicknameModal via socket
    socket.on('save_user_profile', async ({ browserId, username }) => {
      const uid = browserId || socket.userId;
      const cleanName = (username || '').trim();
      if (!cleanName || !uid) return;

      try {
        await User.findOneAndUpdate(
          { userId: uid },
          { username: cleanName, lastSeen: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        socket.username = cleanName;
        socket.emit('profile_saved', {
          browserId: uid,
          username: cleanName,
          success: true
        });
      } catch (err) {
        console.warn('[Save User Profile Error]:', err.message);
      }
    });

    // Join room
    socket.on('join_room', async ({ roomId, username, userId }) => {
      if (!roomId || !username) return;

      // Input sanitization
      const normalizedRoomId = roomId.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '').slice(0, 50);
      const sanitizedUsername = (username || 'Friend').trim().slice(0, 30);
      const uid = userId || socket.id;
      socket.join(normalizedRoomId);

      let room = rooms.get(normalizedRoomId);
      if (!room) {
        // Try restoring room playlist & history from MongoDB Atlas
        let savedRoom = null;
        try {
          savedRoom = await Room.findOne({ roomId: normalizedRoomId });
        } catch (dbErr) {
          console.warn('[MongoDB] Error finding room:', dbErr.message);
        }

        room = {
          id: normalizedRoomId,
          hostUserId: savedRoom?.hostUserId || uid,
          hostId: socket.id,
          members: [],
          playlist: (savedRoom?.playlist && savedRoom.playlist.length > 0) ? savedRoom.playlist : [...DEFAULT_TRACKS],
          currentTrackIndex: savedRoom?.currentTrackIndex || 0,
          isPlaying: false,
          currentTime: 0,
          lastUpdated: Date.now(),
          messages: []
        };
        rooms.set(normalizedRoomId, room);

        // Restore past chat messages from MongoDB if available
        try {
          const pastMessages = await Message.find({ roomId: normalizedRoomId }).sort({ createdAt: 1 }).limit(30);
          if (pastMessages && pastMessages.length > 0) {
            room.messages = pastMessages.map(m => ({
              id: m._id.toString(),
              sender: m.sender,
              text: m.text,
              time: m.time,
              isSystem: m.isSystem
            }));
          }
        } catch (dbMsgErr) {
          console.warn('[MongoDB] Error loading past messages:', dbMsgErr.message);
        }

        // Persist room to MongoDB in background
        Room.findOneAndUpdate(
          { roomId: normalizedRoomId },
          { 
            hostUserId: room.hostUserId,
            hostName: username,
            playlist: room.playlist,
            currentTrackIndex: room.currentTrackIndex,
            lastActive: new Date()
          },
          { upsert: true }
        ).catch(() => {});
      }

      // Resolve unique username in room if someone else has this name
      const uniqueName = resolveUniqueUsername(username, uid, room.members);
      if (uniqueName !== username) {
        socket.emit('username_assigned', { username: uniqueName });
      }

      // ── Max Room Size Check ──────────────────────────────────────────────
      const isAlreadyMember = room.members.some(m =>
        (m.userId && m.userId === uid) || m.id === socket.id
      );
      if (!isAlreadyMember && room.members.length >= MAX_ROOM_SIZE) {
        socket.emit('room_full', {
          message: `Room is full (max ${MAX_ROOM_SIZE} users). Try another room.`
        });
        socket.leave(normalizedRoomId);
        return;
      }
      // ────────────────────────────────────────────────────────────────────

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
        name: uniqueName,
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

        // Persist playlist & active track state to MongoDB in background
        Room.findOneAndUpdate(
          { roomId: room.id },
          { playlist: room.playlist, currentTrackIndex: room.currentTrackIndex, lastActive: new Date() },
          { upsert: true }
        ).catch(() => {});
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

      // Persist updated playlist to MongoDB
      Room.findOneAndUpdate(
        { roomId: room.id },
        { playlist: room.playlist, lastActive: new Date() },
        { upsert: true }
      ).catch(() => {});

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
        const uniqueName = resolveUniqueUsername(username, uid, room.members);
        member.name = uniqueName;

        if (uniqueName !== username) {
          socket.emit('username_assigned', { username: uniqueName });
        }

        // Update User in MongoDB
        User.findOneAndUpdate(
          { userId: uid },
          { username: uniqueName, lastSeen: new Date() },
          { upsert: true }
        ).catch(() => {});

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

      // Persist chat message to MongoDB in background
      Message.create({
        roomId: room.id,
        sender: username,
        text: message,
        time: chatMsg.time,
        isSystem: false
      }).catch(() => {});
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
