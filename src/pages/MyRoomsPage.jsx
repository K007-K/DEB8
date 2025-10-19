import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Clock, ArrowLeft, RefreshCw, X, Trash2, BarChart2, Plus, LogIn, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import HomePageHeader from '../components/HomePageHeader';
import axios from 'axios';
import PollCard from '../components/PollCard';

function MyRoomsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('debates'); // 'debates' or 'polls'
  const [debates, setDebates] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch both debates and polls in parallel
      const [debatesResponse, pollsResponse] = await Promise.all([
        api.get('/api/rooms/my-rooms'),
        api.get('/api/polls/my-polls')
      ]);

      // Handle debates response
      if (debatesResponse.data) {
        setDebates(Array.isArray(debatesResponse.data) ? debatesResponse.data : []);
      } else {
        setDebates([]);
      }

      // Handle polls response
      if (pollsResponse.data && pollsResponse.data.polls) {
        setPolls(Array.isArray(pollsResponse.data.polls) ? pollsResponse.data.polls : []);
      } else {
        setPolls([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch your rooms and polls');
      toast.error('Failed to fetch your rooms and polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) {
      return 'Just now';
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`;
    } else if (diff < 2592000) {
      return `${Math.floor(diff / 86400)} days ago`;
    } else if (diff < 31536000) {
      return `${Math.floor(diff / 2592000)} months ago`;
    } else {
      return `${Math.floor(diff / 31536000)} years ago`;
    }
  };

  const DebateCard = ({ debate, onDelete }) => {
    const is2v2 = debate.debateType === '2vs2';
    return (
      <motion.div
        whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(36, 56, 99, 0.18)' }}
        className="bg-white rounded-2xl shadow-xl p-6 relative font-poppins transition-all duration-300 ease-in-out"
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Delete button for MyRooms */}
        {onDelete && (
          <button
            onClick={() => onDelete(debate.roomId)}
            className="absolute top-3 right-3 p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete Room"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                debate.status === 'LIVE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {debate.status}
              </span>
              <span className="text-sm text-gray-500">
                Started {formatTimeAgo(debate.startTime || debate.createdAt)}
              </span>
              <span className="inline-block mb-2 px-2 py-1 rounded text-xs bg-indigo-50 text-indigo-700 font-semibold">{debate.category || 'Uncategorized'}</span>
              {debate.isPrivate ? (
                <span className="flex items-center gap-1 ml-2">
                  <Lock className="w-4 h-4 text-red-500" title="Private Room" />
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-bold">Private Room</span>
                </span>
              ) : null}
            </div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              {debate.topic}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{debate.description}</p>
            <div className="text-xs text-gray-400 mb-2">Room ID: {debate.roomId}</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {is2v2
                ? `Team1: ${(debate.team1?.members?.length || 0)} | Team2: ${(debate.team2?.members?.length || 0)}`
                : ''}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>{debate.messages?.length || 0} Messages</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>{debate.debateType || 'Standard'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {debate.participants && debate.participants.length > 0 && debate.participants.slice(0, 3).map((participant, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                  title={participant.username}
                >
                  {participant.username[0].toUpperCase()}
                </div>
              ))}
            </div>
            {debate.participants && debate.participants.length > 3 && (
              <span className="text-gray-500 text-sm">
                +{debate.participants.length - 3} more
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
       
            <button
              onClick={() => navigate(`/room/${debate.roomId}`)}
              className="px-4 py-2 bg-[#FB790B] text-white rounded-lg font-bold hover:bg-[#e06d00] transition-all duration-300 ease-in-out shadow"
            >
              View Room
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const handleJoinRoom = async (roomId) => {
    try {
      // First check if user is already in the room
      const roomResponse = await api.get(`/api/rooms/${roomId}`);
      const room = roomResponse.data.room;
      
      if (room.participants.some(p => p.userId === user.id)) {
        // User is already in the room, navigate to it
        navigate(`/room/${roomId}`);
        return;
      }

      // If not in the room, try to join
      const response = await api.post(`/api/rooms/${roomId}/join`, {
        role: 'debater',
        team: null
      });

      if (response.data.success) {
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      if (error.response?.status === 400 && error.response?.data?.message === 'You are already in this room') {
        // If already in room, navigate to it
        navigate(`/room/${roomId}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to join room');
      }
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await api.delete(`/api/rooms/${roomId}`);
      toast.success('Room deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const handleDeletePoll = async (pollId) => {
    try {
      await api.delete(`/api/polls/${pollId}`);
      toast.success('Poll deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('Failed to delete poll');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomePageHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden" style={{ backgroundImage: 'url("/src/pages/assets/bg.jpg")', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      <header className="relative z-10 flex items-center justify-between px-8 pt-8 pb-4 bg-gradient-to-br from-[#1a223d] via-[#233D7B] to-[#2e3a5a] rounded-b-3xl md:rounded-b-[3rem] shadow-2xl">
        <div className="flex items-center text-3xl font-bold font-grotesk cursor-pointer" onClick={() => navigate('/home')}>
          <span className="text-[#233D7B] bg-white px-2 py-1 rounded-lg">Deb</span><span className="text-[#FB790B]">8</span>
        </div>
        <div className="flex items-center gap-6 ml-auto">
          <nav className="flex items-center gap-12 font-poppins text-lg font-bold">
            <span onClick={() => navigate('/create?type=debate')} className="cursor-pointer text-white hover:text-[#FB790B] transition flex items-center gap-2">
              <Plus className="w-6 h-6 text-white" /> Create Room
            </span>
            <span onClick={() => navigate('/my-rooms')} className="cursor-pointer text-white hover:text-[#FB790B] transition flex items-center gap-2">
              <Users className="w-6 h-6 text-white" /> My Rooms
            </span>
          </nav>
          {user && (
            <div className="flex items-center gap-2 ml-4">
              <span onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-[#FB790B] cursor-pointer">
                {user.username[0]?.toUpperCase()}
              </span>
              <span onClick={() => navigate('/profile')} className="text-[#FB790B] text-xl font-bold cursor-pointer hover:underline">
                {user.username}
              </span>
              <span onClick={() => { logout(); navigate('/'); }} className="cursor-pointer text-[#FB790B] hover:text-white transition flex items-center ml-2">
                <LogOut className="w-7 h-7 text-[#FB790B]" />
              </span>
            </div>
          )}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Rooms & Polls</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/create?type=debate')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#FB790B] rounded-lg hover:bg-[#e06d00] transition-all duration-300 ease-in-out shadow"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Create Debate
            </button>
            <button
              onClick={() => navigate('/create?type=poll')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#FB790B] rounded-lg hover:bg-[#e06d00] transition-all duration-300 ease-in-out shadow"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Create Poll
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('debates')}
              className={`${
                activeTab === 'debates'
                  ? 'border-[#FB790B] text-[#FB790B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              My Debates ({debates.length})
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`${
                activeTab === 'polls'
                  ? 'border-[#FB790B] text-[#FB790B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              My Polls ({polls.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'debates' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debates.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No debates yet</h3>
                <p className="mt-2 text-gray-500">Create your first debate to get started!</p>
                <button
                  onClick={() => navigate('/create?type=debate')}
                  className="mt-4 inline-flex items-center px-6 py-3 bg-[#FB790B] text-white rounded-lg font-medium hover:bg-[#e06d00] transition-all duration-300 ease-in-out shadow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Debate
                </button>
              </div>
            ) : (
              debates.map(debate => (
                <DebateCard key={debate.roomId} debate={debate} onDelete={handleDeleteRoom} />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BarChart2 className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No polls yet</h3>
                <p className="mt-2 text-gray-500">Create your first poll to get started!</p>
                <button
                  onClick={() => navigate('/create?type=poll')}
                  className="mt-4 inline-flex items-center px-6 py-3 bg-[#FB790B] text-white rounded-lg font-medium hover:bg-[#e06d00] transition-all duration-300 ease-in-out shadow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Poll
                </button>
              </div>
            ) : (
              polls.map(poll => (
                <div key={poll.pollId} className="relative group">
                  <button
                    onClick={() => handleDeletePoll(poll.pollId)}
                    className="absolute top-3 right-3 z-10 p-2 text-red-600 hover:bg-red-50 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                    title="Delete Poll"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <PollCard 
                    poll={poll} 
                    showResults={true}
                    onVote={(updatedPoll) => {
                      setPolls(prev => prev.map(p => 
                        p.pollId === updatedPoll.pollId ? updatedPoll : p
                      ));
                    }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRoomsPage; 