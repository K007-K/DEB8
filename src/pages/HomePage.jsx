import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Users, TrendingUp, BarChart2, Clock, Lock, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import TrendingPolls from '../components/TrendingPolls';
import DebateCard from '../components/DebateCard';
import PollCard from '../components/PollCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [debates, setDebates] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState('');

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

  const handleJoinRoom = async (e) => {
    e?.preventDefault();
    if (!roomId) return;
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
    }
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 font-sans">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] mb-12"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Welcome to the Arena, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FF9900]">{user?.username}</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-white/60 font-medium mb-8">
            Create a live room, join an ongoing debate, or cast your vote in trending polls.
          </p>
          
          <form onSubmit={handleJoinRoom} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toLowerCase())}
              placeholder="Enter Room ID"
              className="flex-1 px-5 py-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner font-medium"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(251,121,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(251,121,11,0.5)] transform hover:-translate-y-1 flex justify-center items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Join
            </button>
          </form>
        </div>
      </motion.div>

      {/* Bento Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/create?type=debate')}
          className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-[#FB790B] to-[#FF4500] rounded-3xl p-8 sm:p-10 shadow-[0_20px_40px_rgba(251,121,11,0.3)] dark:shadow-[0_20px_40px_rgba(251,121,11,0.2)]"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-16 shadow-inner border border-white/30">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Create Debate</h2>
              <p className="text-white/80 font-medium">Start a 2v2 or Free-For-All room and invite opponents instantly.</p>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
            <ArrowRight className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/create?type=poll')}
          className="cursor-pointer group relative overflow-hidden bg-white/70 dark:bg-black/40 dark:bg-gradient-to-br dark:from-blue-900/20 dark:to-transparent backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-blue-500/50 transition-colors"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-16 shadow-inner border border-blue-200 dark:border-blue-500/30">
              <BarChart2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors group-hover:text-blue-500">Create Poll</h2>
              <p className="text-slate-600 dark:text-white/60 font-medium">Gather public sentiment with real-time, animated voting modules.</p>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
            <ArrowRight className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Trending Debates Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Live Arenas</h2>
          </div>
          <button
            onClick={() => navigate('/debates')}
            className="text-primary font-bold hover:text-[#e06d00] flex items-center gap-1 group"
          >
            View All
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : debates.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
            <p className="text-slate-500 dark:text-white/50 font-bold">No trending debates at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Top Polls</h2>
          </div>
          <button
            onClick={() => navigate('/polls')}
            className="text-blue-500 font-bold hover:text-blue-600 flex items-center gap-1 group"
          >
            View All
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
            <p className="text-slate-500 dark:text-white/50 font-bold">No active polls at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls
              .sort((a, b) => b.totalVotes - a.totalVotes)
              .slice(0, 3)
              .map(poll => (
                <PollCard key={poll._id || poll.roomId} poll={poll} />
              ))}
          </div>
        )}
      </section>

    </div>
  );
}