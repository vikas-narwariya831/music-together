import { useState, useCallback } from 'react';

/**
 * useRoom — manages jam room state (members, messages, room ID, session)
 */
export function useRoom() {
  const [roomId, setRoomId]                   = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [members, setMembers]                 = useState([]);
  const [activeRooms, setActiveRooms]         = useState([]);
  const [messages, setMessages]               = useState([]);
  const [newMessage, setNewMessage]           = useState('');
  const [copied, setCopied]                   = useState(false);
  const [roomClosedToast, setRoomClosedToast] = useState('');

  const copyRoomLink = useCallback((id) => {
    const url = `${window.location.origin}?room=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const addSystemMessage = useCallback((text) => {
    const msg = {
      id: Date.now() + Math.random().toString(),
      sender: 'System',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  return {
    roomId, setRoomId,
    isSessionActive, setIsSessionActive,
    members, setMembers,
    activeRooms, setActiveRooms,
    messages, setMessages,
    newMessage, setNewMessage,
    copied,
    roomClosedToast, setRoomClosedToast,
    copyRoomLink,
    addSystemMessage,
  };
}
