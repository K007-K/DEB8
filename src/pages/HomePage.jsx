import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Users, LogOut, TrendingUp, BarChart2, Clock, Lock, Grid, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import axios from 'axios';
import TrendingPolls from '../components/TrendingPolls';
import { categories } from './categories';
import HomePageHeader from '../components/HomePageHeader';
import DebateIllustration from './assets/debate-illustration.svg';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [debates, setDebates] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [debatesResponse, pollsResponse] = await Promise.all([
        api.get('/api/rooms/debates'),
        api.get('/api/rooms/polls')
      ]);
      
      if (debatesResponse.data) {
        setDebates(debatesResponse.data.filter(room => room.status === 'LIVE'));
      } else {
        setDebates([]);
      }

      if (pollsResponse.data) {
        setPolls(pollsResponse.data.filter(room => room.status === 'LIVE'));
      } else {
        setPolls([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth?mode=login');
      } else {
        toast.error('Failed to fetch rooms. Please try again later.');
      }
      setDebates([]);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to join a room');
        return;
      }

      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room. Please try again.');
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const DebateCard = ({ debate }) => {
    const is2v2 = debate.debateType === '2vs2';
    return (
      <div
        className="bg-white rounded-2xl shadow-xl p-6 font-poppins transition-all duration-300 ease-in-out hover:scale-[1.01]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                debate.status === 'LIVE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {debate.status}
              </span>
              <span className="text-sm text-[#4B587C]">
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
            <h3 className="text-lg font-semibold mb-2 flex items-center text-[#233D7B]">
              {debate.topic}
            </h3>
            <p className="text-sm text-[#4B587C] mb-2 line-clamp-2">{debate.description}</p>
            <div className="text-xs text-[#4B587C] mb-2">Room ID: {debate.roomId}</div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-[#4B587C] text-sm">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {is2v2
                ? `Team1: ${(debate.team1?.members?.length || 0)} | Team2: ${(debate.team2?.members?.length || 0)}`
                : ''}
            </span>
          </div>
          <div className="flex items-center text-[#4B587C] text-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>{debate.messages?.length || 0} Messages</span>
          </div>
          <div className="flex items-center text-[#4B587C] text-sm">
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
              <span className="text-[#4B587C] text-sm">
                +{debate.participants.length - 3} more
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <button
              onClick={() => navigate(`/room/${debate.roomId}`)}
              className="px-4 py-2 bg-[#FB790B] text-white rounded-lg hover:bg-[#e06d00] transition-colors font-poppins"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PollCard = ({ poll }) => (
    <div
      className="bg-white rounded-2xl shadow-xl p-6 font-poppins transition-all duration-300 ease-in-out hover:scale-[1.03]"
    >
      <h3 className="text-lg font-semibold mb-4 text-[#233D7B]">
        {poll.topic}
      </h3>
      <div className="space-y-3">
        {poll.options?.map((option, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{option.text}</span>
              <span>{option.votes} votes</span>
            </div>
            <div className="h-2 bg-[#E3F0FF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
                style={{ width: `${(option.votes / poll.totalVotes) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-[#4B587C]">
          <Users className="w-4 h-4 mr-1" />
          {poll.totalVotes} votes
        </div>
        <div className="flex items-center text-sm text-[#FB790B]">
          <Clock className="w-4 h-4 mr-1" />
          {formatTimeAgo(poll.createdAt)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden" style={{ backgroundImage: 'url("/src/pages/assets/bg.jpg")', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      {/* Floating circles for background, matching landing page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-1/3 top-1/4 w-64 h-64 bg-[#fff]/[0.08] rounded-full blur-2xl" />
        <div className="absolute right-1/4 top-1/3 w-80 h-80 bg-[#fff]/[0.10] rounded-full blur-2xl" />
        {/* Subtle radial overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#ffffff0a] via-transparent to-transparent pointer-events-none" />
      </div>
      {/* Deb8 Logo and Navigation */}
      <header className="relative z-10 flex items-center justify-between px-8 pt-8 pb-4 bg-gradient-to-br from-[#1a223d] via-[#233D7B] to-[#2e3a5a] rounded-b-3xl md:rounded-b-[3rem] shadow-2xl">
        <div className="flex items-center text-3xl font-bold font-grotesk">
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Curved Gradient Section: Welcome + Browse Cards */}
        <div className="bg-gradient-to-br from-[#1a223d] via-[#233D7B] to-[#2e3a5a] rounded-3xl shadow-2xl pb-12 mb-12 w-full px-0 pt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="mt-12">
              <div className="bg-white/10 p-8 text-white shadow-2xl border border-white/10 rounded-2xl">
                <h1 className="text-3xl font-bold mb-4 font-grotesk text-white drop-shadow-lg">Welcome back, {user?.username}!</h1>
                <p className="text-white/90 font-medium mb-8 drop-shadow">Ready to engage in meaningful discussions?</p>
                <div className="flex gap-4 flex-wrap">
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate('/create?type=debate')}
                      className="px-6 py-3 bg-[#FB790B] text-white rounded-lg font-semibold hover:bg-[#e06d00] transition-colors flex items-center font-poppins"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Create Debate
                    </button>
                    <button
                      onClick={() => navigate('/create?type=poll')}
                      className="px-6 py-3 bg-white text-[#233D7B] rounded-lg font-semibold hover:bg-[#f7fafd] border border-[#233D7B] transition-colors flex items-center font-poppins"
                    >
                      <BarChart2 className="w-5 h-5 mr-2" />
                      Create Poll
                    </button>
                  </div>
                  <div className="flex-1 max-w-md">
                    <form onSubmit={() => handleJoinRoom(roomId)} className="flex gap-2">
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.toLowerCase())}
                        placeholder="Enter room ID"
                        className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 font-poppins"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#FB790B] text-white rounded-lg font-semibold hover:bg-[#e06d00] transition-colors font-poppins"
                      >
                        Join Room
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
            <section className="mb-0 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Browse Debates Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/debates')}
                  className="bg-white/10 shadow-2xl p-8 cursor-pointer font-poppins rounded-2xl flex flex-col justify-between"
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white drop-shadow">Browse Debates</h2>
                    <div className="flex items-center justify-center w-10 h-10 bg-[#F3F6FA] rounded-full">
                      <MessageSquare className="w-6 h-6 text-[#233D7B]" />
                    </div>
                  </div>
                  <p className="text-white/90 mb-6 font-medium">
                    Explore and join live debates on various topics. Engage in meaningful discussions with other users.
                  </p>
                  <div className="flex items-center text-[#FB790B] font-medium">
                    View all debates
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
                {/* Browse Polls Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/polls')}
                  className="bg-white/10 shadow-2xl p-8 cursor-pointer font-poppins rounded-2xl flex flex-col justify-between"
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white drop-shadow">Browse Polls</h2>
                    <div className="flex items-center justify-center w-10 h-10 bg-[#F3F6FA] rounded-full">
                      <BarChart2 className="w-6 h-6 text-[#233D7B]" />
                    </div>
                  </div>
                  <p className="text-white/90 mb-6 font-medium">
                    Discover and participate in polls. Share your opinion and see what others think about various topics.
                  </p>
                  <div className="flex items-center text-[#FB790B] font-medium">
                    View all polls
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </section>
          </div>
        </div>

        {/* Trending Debates Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black drop-shadow-lg">Trending Debates</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-[#FB790B]">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="font-medium">Most Active</span>
              </div>
              <button
                onClick={() => navigate('/debates')}
                className="text-[#FB790B] hover:text-[#e06d00] font-medium flex items-center"
              >
                View All
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FB790B]"></div>
            </div>
          ) : debates.length === 0 ? (
            <div className="text-center py-12 bg-white/80 rounded-lg">
              <p className="text-[#233D7B]">No trending debates at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {debates
                .sort((a, b) => b.participants.length - a.participants.length)
                .slice(0, 3)
                .map(room => (
                  <DebateCard key={room.roomId} debate={room} />
                ))}
            </div>
          )}
        </section>

        {/* Trending Polls Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black drop-shadow-lg">Trending Polls</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-[#FB790B]">
                <BarChart2 className="w-5 h-5 mr-2" />
                <span className="font-medium">Most Voted</span>
              </div>
              <button
                onClick={() => navigate('/polls')}
                className="text-[#FB790B] hover:text-[#e06d00] font-medium flex items-center"
              >
                View All
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <TrendingPolls />
        </section>
      </main>
    </div>
  );
}

export default HomePage;