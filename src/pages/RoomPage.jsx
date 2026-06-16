import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Clock, Send, ArrowLeft, ThumbsUp, ThumbsDown, Flame, Zap, X, AlertTriangle, Share2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../api/axios';
import axiosNoAuth from '../api/axiosNoAuth';
import FreeForAllRoom from './FreeForAllRoom';
import TeamDebateRoom from './TeamDebateRoom';


function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [debateMessages, setDebateMessages] = useState([]);
  const [audienceMessages, setAudienceMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({
    thumbsUp: 0,
    thumbsDown: 0,
    flame: 0,
    lightning: 0
  });
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const [userReactions, setUserReactions] = useState({});
  const [showKickModal, setShowKickModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [kickReason, setKickReason] = useState('');
  const [kickedUsers, setKickedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [quickReactions, setQuickReactions] = useState({
    thumbsUp: 24,
    thumbsDown: 8,
    flame: 42,
    lightning: 16
  });
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const roomRef = useRef(room);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinStep, setJoinStep] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/rooms/${roomId}`);
        
        if (response.data && response.data.room) {
          const roomData = response.data.room;
          console.log('Room data:', roomData);
          console.log('Debate type:', roomData.debateType);
          console.log('Messages in room data:', roomData.messages?.length || 0);
          
          // Set room data first
          setRoom(roomData);
          roomRef.current = roomData;
          
          // Load messages from room data
          if (roomData.messages && roomData.messages.length > 0) {
            console.log('Loading messages from room data:', roomData.messages);
            if (roomData.debateType === 'freeForAll') {
              setDebateMessages(roomData.messages);
              setAudienceMessages([]);
            } else {
              const debateMsgs = roomData.messages.filter(msg => msg.type === 'debate');
              const audienceMsgs = roomData.messages.filter(msg => msg.type === 'audience');
              console.log('Filtered messages - Debate:', debateMsgs.length, 'Audience:', audienceMsgs.length);
              setDebateMessages(debateMsgs);
              setAudienceMessages(audienceMsgs);
            }
          } else {
            console.log('No messages in room data');
            setDebateMessages([]);
            setAudienceMessages([]);
          }
          
          // Check if user is already a participant
            const savedRole = localStorage.getItem(`room_${roomId}_role`);
            const savedTeam = localStorage.getItem(`room_${roomId}_team`);
            const userParticipant = roomData.participants?.find(p => p.userId === user?.id);
            if (userParticipant) {
              setUserRole(userParticipant.role);
              setSelectedTeam(userParticipant.team);
              setShowJoinModal(false);
            } else if (savedRole) {
              setUserRole(savedRole);
              setSelectedTeam(savedTeam);
              setShowJoinModal(false);
            } else {
              setShowJoinModal(true);
              setUserRole('');
              setSelectedTeam(null);
          }
          
          setParticipants(roomData.participants || []);
        } else {
          throw new Error('Invalid room data received');
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
        setError(error.message || 'Failed to load room');
        
        if (error.response?.status === 404) {
          toast.error('Room not found');
        } else if (error.response?.status === 401 || !user) {
          toast.error('Please login to view this room');
          navigate('/auth?mode=login');
        } else {
          toast.error(error.message || 'Failed to load room');
        }
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, navigate, user]);

  // Update room data when messages change
  useEffect(() => {
    if (room && (debateMessages.length > 0 || audienceMessages.length > 0)) {
      const updatedRoom = {
        ...room,
        messages: [...debateMessages, ...audienceMessages]
      };
      setRoom(updatedRoom);
      roomRef.current = updatedRoom;
      console.log('Updated room with messages:', updatedRoom.messages.length);
    }
  }, [debateMessages, audienceMessages]);

  useEffect(() => {
    console.log('Socket useEffect running. room:', room, 'user:', user, 'roomId:', roomId);
    if (!room) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to join the room');
      navigate('/auth?mode=login');
      return;
    }

    // Create new socket connection
    const newSocket = io('https://deb8.onrender.com', {
      auth: { token },
      query: { roomId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket'],
      forceNew: true
    });

    // Set socket immediately
    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Connected to socket server after joining room');
      setIsConnected(true);
      
      newSocket.emit('joinRoom', { roomId }, (response) => {
        console.log('Join room socket response:', response);
        if (response?.error) {
          console.error('Error joining room:', response.error);
          toast.error(response.error);
        } else {
          console.log('Successfully joined room socket');
          // Request room data after successful connection
          newSocket.emit('getRoomData', { roomId });
        }
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connect_error:', err);
      setIsConnected(false);
      toast.error('Connection error. Please check if the server is running.');
    });

    // Add a function to check if a message already exists
    const messageExists = (message, messages) => {
      return messages.some(msg => 
        msg.content === message.content && 
        msg.userId === message.userId && 
        msg.timestamp === message.timestamp
      );
    };

    // Update the message handling in socket event
    newSocket.on('message', (message) => {
      console.log('Received message from server:', message);
      
      try {
        if (!message || typeof message !== 'object') {
          console.error('Invalid message format received:', message);
          return;
        }
        
        // The server should send a complete message object
        if (roomRef.current.debateType === 'freeForAll') {
          if (!messageExists(message, debateMessages)) {
          setDebateMessages(prev => [...prev, message]);
          console.log('Added to debate messages (freeForAll)');
          }
        } else {
          // For team debate rooms, we need to handle both debate and audience messages
          if (message.type === 'debate') {
            if (!messageExists(message, debateMessages)) {
            setDebateMessages(prev => {
              const newMessages = [...prev, message];
              console.log('Added debate message to state array, new length:', newMessages.length);
              return newMessages;
            });
            }
          } else if (message.type === 'audience') {
            if (!messageExists(message, audienceMessages)) {
            setAudienceMessages(prev => {
              const newMessages = [...prev, message];
              console.log('Added audience message to state array, new length:', newMessages.length);
              return newMessages;
            });
            }
          } else {
            console.warn('Unknown message type:', message.type);
          }
        }
        
        // Scroll to bottom after new message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Update roomData handler to not duplicate messages
    newSocket.on('roomData', (data) => {
      console.log('Received room data:', data);
      setRoom(prev => ({ ...prev, ...data }));
      
      if (data.messages) {
        if (room.debateType === 'freeForAll') {
          // Only update if messages are different
          if (JSON.stringify(data.messages) !== JSON.stringify(debateMessages)) {
          setDebateMessages(data.messages);
          setAudienceMessages([]);
          }
        } else {
          const newDebateMsgs = data.messages.filter(msg => msg.type === 'debate');
          const newAudienceMsgs = data.messages.filter(msg => msg.type === 'audience');
          
          // Only update if messages are different
          if (JSON.stringify(newDebateMsgs) !== JSON.stringify(debateMessages)) {
            setDebateMessages(newDebateMsgs);
          }
          if (JSON.stringify(newAudienceMsgs) !== JSON.stringify(audienceMessages)) {
            setAudienceMessages(newAudienceMsgs);
          }
        }
      }
      if (data.participants) setParticipants(data.participants);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error');
    });

    newSocket.on('userLeft', ({ userId }) => {
      setRoom(prevRoom => ({
        ...prevRoom,
        participants: prevRoom.participants.filter(p => p._id !== userId)
      }));
    });

    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      }
    };
  }, [user, roomId, navigate, room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debateMessages, audienceMessages]);

  // Only render chat interface if user has joined (role is set, and for debater, team is set)
  const canAccessChat = room?.debateType === 'freeForAll' ||
    (userRole === 'audience') ||
    (userRole === 'debater' && selectedTeam);

  const sendMessage = () => {
    console.log('Attempting to send message...');
    console.log('Current state:', {
      message,
      socket: socket?.connected,
      userRole,
      selectedTeam,
      roomType: room?.debateType
    });

    if (!message.trim()) {
      console.log('Message is empty, not sending');
      return;
    }
    
    // Check if socket is available
    if (!socket || !socket.connected) {
      console.error('Socket not connected. Socket state:', {
        socketExists: !!socket,
        isConnected: socket?.connected,
        socketId: socket?.id
      });
      toast.error('Connection lost. Please refresh the page.');
      return;
    }

    // Validate room data
    if (!roomRef.current || !roomRef.current._id) {
      console.error('Invalid room data:', roomRef.current);
      toast.error('Room data is invalid. Please refresh the page.');
      return;
    }
    
    // Create message object with the format the server expects
    const messageData = {
      roomId: roomRef.current.roomId,
      content: message,
      userId: user.id,
      username: user.username,
      type: roomRef.current.debateType === 'freeForAll' ? 'debate' : 
            (userRole === 'debater' ? 'debate' : 'audience'),
      team: selectedTeam
    };
    
    console.log('Sending message with data:', messageData);
    console.log('Socket state:', {
      connected: socket.connected,
      id: socket.id,
      hasListeners: socket.hasListeners('message')
    });
    
    try {
      // Send message directly matching the server expected format
      socket.emit('message', messageData, (response) => {
        console.log('Message emit response:', response);
        if (response && response.error) {
          console.error('Server rejected message:', response.error);
          toast.error(`Failed to send message: ${response.error}`);
          
          // If room not found, try to refresh room data
          if (response.error === 'Room not found') {
            console.log('Attempting to refresh room data...');
            fetchRoomData();
          }
        } else if (response && response.success) {
          console.log('Message sent successfully!');
          // Don't add message to local state here - wait for socket event
        }
      });
      console.log('Message emit sent to server');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/rooms/${roomId}`);
      
      if (response.data.success) {
        toast.success('Room deleted successfully');
        navigate('/home');
      } else {
        throw new Error(response.data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      if (error.response?.status === 403) {
        toast.error('Only the room creator can delete this room');
      } else if (error.response?.status === 404) {
        toast.error('Room not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await api.post(`/api/rooms/${roomId}/leave`);
      if (socket) {
        socket.disconnect();
      }
      // Reset join state
      setUserRole('');
      setSelectedTeam(null);
      setShowJoinModal(true);
      // Clear local storage
      localStorage.removeItem(`room_${roomId}_role`);
      localStorage.removeItem(`room_${roomId}_team`);
      navigate('/my-rooms');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  const handleJoinRoom = async (role, team = null) => {
    try {
      console.log('Joining room with role:', role, 'team:', team);
      
      if (room?.debateType === 'freeForAll') {
        setShowJoinModal(false);
        return;
      }

      // Clear any existing role/team from local storage
      localStorage.removeItem(`room_${roomId}_role`);
      localStorage.removeItem(`room_${roomId}_team`);

      const response = await api.post(`/api/rooms/${roomId}/join`, {
        role,
        team,
        password: room?.isPrivate ? joinPassword : undefined,
      });

      console.log('Join room response:', response.data);

      if (response.data.success) {
        setUserRole(role || 'debater');
        setSelectedTeam(team);
        setShowJoinModal(false);
        
        // Update room data with the response
        if (response.data.room) {
          setRoom(response.data.room);
          setParticipants(response.data.room.participants || []);
          if (response.data.room.messages) {
            if (response.data.room.debateType === 'freeForAll') {
              setDebateMessages(response.data.room.messages);
              setAudienceMessages([]);
            } else {
              setDebateMessages(response.data.room.messages.filter(msg => msg.type === 'debate'));
              setAudienceMessages(response.data.room.messages.filter(msg => msg.type === 'audience'));
            }
          }
        }
        
        // Reconnect socket after joining room
        if (socket) {
          console.log('Disconnecting existing socket...');
          // Add a small delay before disconnecting
          setTimeout(() => {
          socket.disconnect();
          }, 100);
        }
        
        // Create new socket connection
        const token = localStorage.getItem('token');
        console.log('Creating new socket connection with token:', !!token);
        
        const newSocket = io('https://deb8.onrender.com', {
          auth: { token },
          query: { roomId },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['websocket'],
          forceNew: true
        });

        // Set socket immediately
        setSocket(newSocket);
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          console.log('Connected to socket server after joining room');
          setIsConnected(true);
          
          newSocket.emit('joinRoom', { roomId }, (response) => {
            console.log('Join room socket response:', response);
            if (response?.error) {
              console.error('Error joining room:', response.error);
              toast.error(response.error);
            } else {
              console.log('Successfully joined room socket');
              // Request room data after successful connection
              newSocket.emit('getRoomData', { roomId });
            }
          });
        });

        newSocket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connect_error:', err);
          setIsConnected(false);
          toast.error('Connection error. Please check if the server is running.');
        });

        // Listen for messages from the server
        newSocket.on('message', (message) => {
          console.log('Received message from server:', message);
          
          try {
            if (!message || typeof message !== 'object') {
              console.error('Invalid message format received:', message);
              return;
            }
            
            // The server should send a complete message object
            if (roomRef.current.debateType === 'freeForAll') {
              if (!messageExists(message, debateMessages)) {
              setDebateMessages(prev => [...prev, message]);
              console.log('Added to debate messages (freeForAll)');
              }
            } else {
              // For team debate rooms, we need to handle both debate and audience messages
              if (message.type === 'debate') {
                if (!messageExists(message, debateMessages)) {
                setDebateMessages(prev => {
                  const newMessages = [...prev, message];
                  console.log('Added debate message to state array, new length:', newMessages.length);
                  return newMessages;
                });
                }
              } else if (message.type === 'audience') {
                if (!messageExists(message, audienceMessages)) {
                setAudienceMessages(prev => {
                  const newMessages = [...prev, message];
                  console.log('Added audience message to state array, new length:', newMessages.length);
                  return newMessages;
                });
                }
              } else {
                console.warn('Unknown message type:', message.type);
              }
            }
            
            // Scroll to bottom after new message
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          } catch (error) {
            console.error('Error processing message:', error);
          }
        });

        newSocket.on('roomData', (data) => {
          console.log('Received room data:', data);
          setRoom(prev => ({ ...prev, ...data }));
          
          if (data.messages) {
            if (room.debateType === 'freeForAll') {
              // Only update if messages are different
              if (JSON.stringify(data.messages) !== JSON.stringify(debateMessages)) {
              setDebateMessages(data.messages);
              setAudienceMessages([]);
              }
            } else {
              const newDebateMsgs = data.messages.filter(msg => msg.type === 'debate');
              const newAudienceMsgs = data.messages.filter(msg => msg.type === 'audience');
              
              // Only update if messages are different
              if (JSON.stringify(newDebateMsgs) !== JSON.stringify(debateMessages)) {
                setDebateMessages(newDebateMsgs);
              }
              if (JSON.stringify(newAudienceMsgs) !== JSON.stringify(audienceMessages)) {
                setAudienceMessages(newAudienceMsgs);
              }
            }
          }
          if (data.participants) setParticipants(data.participants);
        });

        newSocket.on('error', (error) => {
          console.error('Socket error:', error);
          toast.error(error.message || 'Connection error');
        });

        toast.success('Joined room successfully!');
        setJoinError('');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      if (error.response?.status === 400 && error.response?.data?.message === 'You are already in this room') {
        // If already in room, update the UI with current role
        const currentParticipant = participants.find(p => p.userId === user?.id);
        if (currentParticipant) {
          setUserRole(currentParticipant.role);
          setSelectedTeam(currentParticipant.team);
          setShowJoinModal(false);
          localStorage.setItem(`room_${roomId}_role`, currentParticipant.role);
          localStorage.setItem(`room_${roomId}_team`, currentParticipant.team || '');
        }
      } else {
        if (error.response?.data?.message === 'Incorrect password') {
          setJoinError('Incorrect password. Please try again.');
        } else if (error.response?.data?.message === 'Password is required for this private room') {
          setJoinError('Password is required for this private room.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to join room');
        }
      }
    }
  };

  const handleReaction = (type) => {
    if (room.status === 'TERMINATED') {
      toast.error('This room has been terminated');
      return;
    }

    const hasReacted = userReactions[type]?.[user.id];
    if (hasReacted) {
      toast.error('You have already reacted with this emoji');
      return;
    }

    socketRef.current.emit('reaction', { type, roomId, userId: user.id });
    setUserReactions(prev => ({
      ...prev,
      [type]: {
        ...(prev[type] || {}),
        [user.id]: 1
      }
    }));
  };

  const handleTerminateRoom = async () => {
    if (!window.confirm('Are you sure you want to terminate this room? This action cannot be undone.')) {
      return;
    }

    try {
      await api.post(`/api/rooms/${roomId}/terminate`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      socketRef.current.emit('terminateRoom', { roomId });
      toast.success('Room terminated successfully');
      setRoom(prev => ({ ...prev, status: 'TERMINATED' }));
    } catch (error) {
      toast.error('Failed to terminate room');
    }
  };

  const handleKickUser = async () => {
    if (!selectedUser || !kickReason.trim()) {
      toast.error('Please provide a reason for kicking the user');
      return;
    }

    try {
      await api.post(`/api/rooms/${roomId}/kick`, {
        userId: selectedUser.id,
        reason: kickReason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      socketRef.current.emit('kickUser', { roomId, userId: selectedUser.id, reason: kickReason });
      setKickedUsers(prev => [...prev, { userId: selectedUser.id, reason: kickReason }]);
      setParticipants(prev => prev.filter(p => p.id !== selectedUser.id));
      setShowKickModal(false);
      setSelectedUser(null);
      setKickReason('');
      toast.success('User has been kicked from the room');
    } catch (error) {
      toast.error('Failed to kick user');
    }
  };

  const handleQuickReaction = (type) => {
    if (!isConnected) {
      toast.error('Please wait for connection to be established');
      return;
    }

    if (userReactions[type]) {
      toast.error('You can only react once with each emoji');
      return;
    }

    socket?.emit('reaction', {
      roomId,
      type,
      userId: user?.id,
      username: user?.username
    });

    setUserReactions(prev => ({
      ...prev,
      [type]: true
    }));

    setQuickReactions(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  // Validate password before showing join options
  const handlePasswordCheck = async () => {
    try {
      const response = await api.post(`/api/rooms/${roomId}/join`, {
        password: joinPassword,
        role: 'check',
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setJoinStep(2);
      setJoinError('');
    } catch (error) {
      if (error.response?.data?.message === 'Incorrect password') {
        setJoinError('Incorrect password. Please try again.');
        return;
      } else if (error.response?.data?.message === 'Password is required for this private room') {
        setJoinError('Password is required for this private room.');
        return;
      } else {
        setJoinError(error.response?.data?.message || 'Failed to check password');
        return;
      }
    }
  };

  // Only render JoinModal if user is not a participant
  const JoinModal = () => {
    if (!room) return null;
    
    // Step 1: Password prompt for private rooms
    if (room.isPrivate && joinStep === 1) {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8)] font-sans">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Enter Password</h2>
            <div className="space-y-4">
              <input
                type="password"
                value={joinPassword}
                onChange={e => setJoinPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium transition-all"
                placeholder="Room password"
                autoFocus
              />
              {joinError && <div className="text-red-500 font-bold text-sm bg-red-100 dark:bg-red-500/10 px-4 py-2 rounded-lg">{joinError}</div>}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handlePasswordCheck}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                  disabled={!joinPassword}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Show join options
    if (room.debateType === 'freeForAll') {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8)] font-sans text-center">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Join Arena</h2>
            <p className="text-slate-500 dark:text-white/60 font-medium mb-8">Enter this free-for-all debate and share your thoughts.</p>
            <button
              onClick={() => handleJoinRoom('debater')}
              className="w-full px-6 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_4px_15px_rgba(251,121,11,0.4)]"
            >
              Enter Room
            </button>
          </div>
        </div>
      );
    }

    // For 2vs2, show full join options
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8)] font-sans">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 text-center">Join Arena</h2>
          <div className="space-y-4">
            <button
              onClick={() => setUserRole('debater')}
              className={`w-full p-5 rounded-xl border text-left transition-all ${
                userRole === 'debater' ? 'border-primary bg-primary/10' : 'border-slate-200 dark:border-white/10 hover:border-primary/50'
              }`}
            >
              <h3 className={`text-lg font-bold ${userRole === 'debater' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Join as Debater</h3>
              <p className="text-sm text-slate-500 dark:text-white/60 font-medium mt-1">Participate in the debate</p>
            </button>

            <button
              onClick={() => setUserRole('audience')}
              className={`w-full p-5 rounded-xl border text-left transition-all ${
                userRole === 'audience' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
              }`}
            >
              <h3 className={`text-lg font-bold ${userRole === 'audience' ? 'text-blue-500' : 'text-slate-900 dark:text-white'}`}>Join as Audience</h3>
              <p className="text-sm text-slate-500 dark:text-white/60 font-medium mt-1">Watch and comment</p>
            </button>

            {room.debateType === '2vs2' && userRole === 'debater' && (
              <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-top-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-center">Select Your Team</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedTeam('team1')}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedTeam === 'team1' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/50'
                    }`}
                  >
                    <h3 className={`font-bold ${selectedTeam === 'team1' ? 'text-indigo-500' : 'text-slate-900 dark:text-white'}`}>{room.team1?.name || 'Team A'}</h3>
                    <p className="text-xs text-slate-500 dark:text-white/60 font-medium mt-1 line-clamp-2">{room.team1?.description}</p>
                  </button>
                  <button
                    onClick={() => setSelectedTeam('team2')}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedTeam === 'team2' ? 'border-pink-500 bg-pink-500/10' : 'border-slate-200 dark:border-white/10 hover:border-pink-500/50'
                    }`}
                  >
                    <h3 className={`font-bold ${selectedTeam === 'team2' ? 'text-pink-500' : 'text-slate-900 dark:text-white'}`}>{room.team2?.name || 'Team B'}</h3>
                    <p className="text-xs text-slate-500 dark:text-white/60 font-medium mt-1 line-clamp-2">{room.team2?.description}</p>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-8">
              {(userRole === 'audience' || (userRole === 'debater' && (room.debateType !== '2vs2' || selectedTeam))) && (
                <button
                  onClick={() => handleJoinRoom(userRole, selectedTeam)}
                  className={`w-full px-6 py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg ${
                    userRole === 'audience' ? 'bg-blue-500 hover:bg-blue-600 shadow-[0_4px_15px_rgba(59,130,246,0.4)]' : 'bg-primary hover:bg-primary/90 shadow-[0_4px_15px_rgba(251,121,11,0.4)]'
                  }`}
                >
                  Enter Arena
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Cleanup function to handle component unmount
    return () => {
      const leaveRoom = async () => {
        try {
          if (socket) {
            socket.disconnect();
          }
          await api.post(`/api/rooms/${roomId}/leave`);
        } catch (error) {
          console.error('Error leaving room:', error);
        }
      };
      leaveRoom();
    };
  }, [roomId]);

  useEffect(() => { 
    roomRef.current = room; 
    if (room) {
      console.log('Updated roomRef with latest room data:');
      console.log('Room ID:', room._id);
      console.log('Debate Type:', room.debateType);
      console.log('Participants:', room.participants);
      console.log('Message count:', room.messages?.length || 0);
    }
  }, [room]);

  // When room or showJoinModal changes, reset joinStep if needed
  useEffect(() => {
    if (room?.isPrivate) {
      setJoinStep(1);
    } else {
      setJoinStep(2);
    }
  }, [room, showJoinModal]);

  const handleShare = async () => {
    try {
      const roomUrl = `${window.location.origin}/room/${roomId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: room?.topic || 'Debate Room',
          text: `Join me in this debate: ${room?.topic}`,
          url: roomUrl
        });
      } else {
        await navigator.clipboard.writeText(roomUrl);
        toast.success('Room link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing room:', error);
      if (error.name !== 'AbortError') {
        toast.error('Failed to share room');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 font-sans p-4">
        <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Error Loading Arena</h2>
          <p className="text-slate-500 dark:text-white/60 font-medium mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="w-full px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white transition-all shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col relative z-10 font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.08] px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col items-start w-full">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1 line-clamp-1 flex items-center gap-2">
            {room?.topic}
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
              room?.status === 'LIVE' 
                ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' 
                : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
            }`}>
              {room?.status || 'LIVE'}
            </span>
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-white/50 font-medium">
            <span>ID: {room?.roomId}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {room?.participants?.length || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            onClick={handleLeaveRoom}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-100 dark:border-red-500/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </button>
        </div>
      </div>

      {/* Main Content (Chats) */}
      <div className="flex-1 overflow-hidden relative">
        {room?.debateType === '2vs2' ? (
          <TeamDebateRoom
            room={room}
            userRole={userRole}
            selectedTeam={selectedTeam}
            debateMessages={debateMessages}
            audienceMessages={audienceMessages}
            message={message}
            setMessage={setMessage}
            handleSendMessage={sendMessage}
            formatDate={formatDate}
            messagesEndRef={messagesEndRef}
            user={user}
            isConnected={isConnected}
          />
        ) : (
          <FreeForAllRoom
            messages={debateMessages}
            message={message}
            setMessage={setMessage}
            handleSendMessage={sendMessage}
            formatDate={formatDate}
            messagesEndRef={messagesEndRef}
            room={room}
            onLeaveRoom={handleLeaveRoom}
            user={user}
            isConnected={isConnected}
          />
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && <JoinModal />}
    </div>
  );
}

export default RoomPage;
