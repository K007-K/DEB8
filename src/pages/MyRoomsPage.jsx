import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, BarChart2, Plus, Users, Clock, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PollCard from '../components/PollCard';

function MyRoomsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('debates');
  const [debates, setDebates] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth?mode=login');
        return;
      }

      const [debatesResponse, pollsResponse] = await Promise.all([
        api.get('/api/rooms/my-rooms'),
        api.get('/api/polls/my-polls')
      ]);

      if (debatesResponse.data) {
        setDebates(Array.isArray(debatesResponse.data) ? debatesResponse.data : []);
      } else {
        setDebates([]);
      }

      if (pollsResponse.data && pollsResponse.data.polls) {
        setPolls(Array.isArray(pollsResponse.data.polls) ? pollsResponse.data.polls : []);
      } else {
        setPolls([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch your rooms and polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
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

  const DebateCardMini = ({ debate, onDelete }) => {
    const is2v2 = debate.debateType === '2vs2';
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative group font-sans flex flex-col h-full"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(debate.roomId); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          title="Delete Room"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
            debate.status === 'LIVE' 
              ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' 
              : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
          }`}>
            {debate.status}
          </span>
          <span className="text-xs text-slate-500 dark:text-white/50 font-medium">
            {formatTimeAgo(debate.startTime || debate.createdAt)}
          </span>
          {debate.isPrivate && (
            <span className="ml-auto flex items-center gap-1 text-red-500 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded-lg text-xs font-bold">
              <Lock className="w-3 h-3" /> Private
            </span>
          )}
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
          {debate.topic}
        </h3>
        <p className="text-sm text-slate-600 dark:text-white/60 mb-6 line-clamp-2 flex-grow">
          {debate.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-white/50">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{debate.participants?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{debate.messages?.length || 0}</span>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/room/${debate.roomId}`)}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-md"
          >
            Enter Arena
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">My Content</h1>
          <p className="text-lg text-slate-600 dark:text-white/60 font-medium">
            Manage your arenas and active polls.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/create?type=debate')}
            className="px-6 py-3.5 bg-primary/10 text-primary border border-primary/20 font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            New Debate
          </button>
          <button
            onClick={() => navigate('/create?type=poll')}
            className="px-6 py-3.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-5 h-5" />
            New Poll
          </button>
        </div>
      </div>

      {/* Glassmorphic Tabs */}
      <div className="flex items-center gap-2 mb-10 bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('debates')}
          className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'debates' 
              ? 'text-slate-900 dark:text-white shadow-md' 
              : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
          }`}
        >
          {activeTab === 'debates' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white dark:bg-black/60 rounded-xl"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> My Debates ({debates.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('polls')}
          className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'polls' 
              ? 'text-slate-900 dark:text-white shadow-md' 
              : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
          }`}
        >
          {activeTab === 'polls' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white dark:bg-black/60 rounded-xl"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> My Polls ({polls.length})
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'debates' ? (
            <motion.div
              key="debates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {debates.length === 0 ? (
                <div className="col-span-full text-center py-24 bg-white/50 dark:bg-black/20 rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-slate-400 dark:text-white/20" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No debates yet</h3>
                  <p className="text-slate-500 dark:text-white/50 font-medium mb-8">You haven't participated in any debates.</p>
                  <button onClick={() => navigate('/create?type=debate')} className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(251,121,11,0.4)] hover:bg-orange-600 transition-colors">
                    Start a Debate
                  </button>
                </div>
              ) : (
                debates.map((debate, index) => (
                  <motion.div key={debate.roomId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <DebateCardMini debate={debate} onDelete={handleDeleteRoom} />
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="polls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {polls.length === 0 ? (
                <div className="col-span-full text-center py-24 bg-white/50 dark:bg-black/20 rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart2 className="w-10 h-10 text-blue-400 dark:text-blue-500/50" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No polls yet</h3>
                  <p className="text-slate-500 dark:text-white/50 font-medium mb-8">You haven't created any polls.</p>
                  <button onClick={() => navigate('/create?type=poll')} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.4)] hover:bg-blue-600 transition-colors">
                    Create a Poll
                  </button>
                </div>
              ) : (
                polls.map((poll, index) => (
                  <motion.div key={poll.pollId} className="relative group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <button
                      onClick={() => handleDeletePoll(poll.pollId)}
                      className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Poll"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <PollCard 
                      poll={poll} 
                      showResults={true}
                      onVote={(updatedPoll) => {
                        setPolls(prev => prev.map(p => p.pollId === updatedPoll.pollId ? updatedPoll : p));
                      }}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default MyRoomsPage;