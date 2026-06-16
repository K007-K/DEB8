import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { categories } from './categories';
import DebateCard from '../components/DebateCard';

export default function BrowseDebates() {
  const navigate = useNavigate();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

      setLoading(true);
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

  const filteredDebates = debates.filter(debate => 
    (selectedCategory === 'All' || debate.category === selectedCategory) &&
    (debate.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    debate.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Live Arenas</h1>
          <p className="text-lg text-slate-600 dark:text-white/60 font-medium">
            Join ongoing debates or watch the chaos unfold.
          </p>
        </div>
        <button
          onClick={() => navigate('/create?type=debate')}
          className="px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(251,121,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(251,121,11,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create Arena
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-[88px] z-30 mb-10">
        <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col lg:flex-row gap-4 transition-colors duration-500">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-white/30" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic or description..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner font-medium"
            />
          </div>

          {/* Categories Scrollable Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar flex-shrink-0">
            <div className="flex items-center gap-2 px-1">
              <Filter className="w-5 h-5 text-slate-400 dark:text-white/30 mr-2 flex-shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ease-in-out focus:outline-none flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-[0_4px_15px_rgba(251,121,11,0.4)]'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredDebates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-white/50 dark:bg-black/20 rounded-[2rem] border border-dashed border-slate-300 dark:border-white/10"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-slate-400 dark:text-white/20" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No arenas found</h3>
          <p className="text-slate-500 dark:text-white/50 font-medium mb-8">
            {searchQuery || selectedCategory !== 'All' 
              ? "We couldn't find any debates matching your filters." 
              : "It's quiet in here. Be the first to start a debate!"}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              if (!searchQuery && selectedCategory === 'All') navigate('/create?type=debate');
            }}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-md inline-flex items-center gap-2"
          >
            {searchQuery || selectedCategory !== 'All' ? 'Clear Filters' : 'Create Arena'}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDebates.map((debate, index) => (
              <motion.div
                key={debate._id || debate.roomId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <DebateCard debate={debate} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
    </div>
  );
}