import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Clock, ArrowLeft, Plus, LogIn, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import HomePageHeader from '../components/HomePageHeader';
import { categories } from './categories';

function BrowseDebates() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const getCategoryParam = (cat) => {
    if (cat === 'All') return undefined;
    return cat;
  };

  useEffect(() => {
    fetchDebates();
  }, [selectedCategory]);

  const fetchDebates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        navigate('/auth?mode=login');
        return;
      }

      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const response = await api.get('/api/rooms/debates', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data) {
        setDebates(response.data);
      } else {
        setDebates([]);
      }
    } catch (error) {
      console.error('Error fetching debates:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth?mode=login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch debates');
      }
      setDebates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      const response = await api.post(`/api/rooms/${roomId}/join`);
      if (response.data.success) {
        toast.success('Joined room successfully');
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      if (error.response?.status === 400) {
        toast.error('Room is full');
      } else if (error.response?.status === 404) {
        toast.error('Room not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to join room');
      }
    }
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const DebateCard = ({ debate }) => {
    console.log('DebateCard:', debate.roomId, 'isPrivate:', debate.isPrivate);
    const is2v2 = debate.debateType === '2vs2';
    return (
      <motion.div
        initial={{ backgroundColor: '#fff' }}
        animate={{ backgroundColor: '#fff' }}
        whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(36, 56, 99, 0.18)', backgroundColor: '#fff' }}
        className="bg-white rounded-2xl shadow-xl p-6 font-poppins transition-all duration-300 ease-in-out"
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
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
              {debate.isPrivate && (
                <span className="flex items-center gap-1 ml-2">
                  <Lock className="w-4 h-4 text-red-500" title="Private Room" />
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-bold">Private Room</span>
                </span>
              )}
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
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/room/${debate.roomId}`)}
              className="px-4 py-2 bg-[#FB790B] text-white rounded-lg font-bold hover:bg-[#e06d00] transition-colors shadow"
            >
              View Room
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden" style={{ backgroundImage: 'url("/src/pages/assets/bg.jpg")', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      {/* Deb8 Logo and Navigation */}
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
              <span onClick={handleLogout} className="cursor-pointer text-[#FB790B] hover:text-white transition flex items-center ml-2">
                <LogOut className="w-7 h-7 text-[#FB790B]" />
              </span>
            </div>
          )}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Browse Debates</h1>
              <button
                onClick={() => navigate('/create?type=debate')}
                className="flex items-center px-4 py-2 bg-[#FB790B] text-white rounded-lg font-bold hover:bg-[#e06d00] transition-colors shadow"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Debate
              </button>
            </div>
            <p className="text-gray-600">Join debates and participate in meaningful discussions</p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium border transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FB790B] ${
                  selectedCategory === cat
                    ? 'bg-white text-[#233D7B] border-[#FB790B] font-bold shadow'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#233D7B] hover:text-[#233D7B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search debates..."
              className="w-full px-6 py-3 text-lg rounded-lg bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Debates Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : debates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No debates found</h3>
              <p className="mt-2 text-gray-500">Be the first to create a debate!</p>
              <button
                onClick={() => navigate('/create?type=debate')}
                className="mt-4 flex items-center mx-auto px-6 py-3 bg-[#FB790B] text-white rounded-lg font-bold hover:bg-[#e06d00] transition-colors shadow"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Debate
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {debates
                .filter(debate => 
                  (selectedCategory === 'All' || debate.category === selectedCategory) &&
                  (debate.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  debate.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(debate => (
                  <DebateCard key={debate._id} debate={debate} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowseDebates; 