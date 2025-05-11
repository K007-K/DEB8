import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Clock, ArrowLeft, Plus, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import HomePageHeader from '../components/HomePageHeader';
import PollCard from '../components/PollCard';
import { categories } from './categories';

function BrowsePolls() {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Polls');

  useEffect(() => {
    fetchPolls();
  }, [selectedCategory]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/polls', {
        params: {
          category: selectedCategory === 'All Polls' ? undefined : selectedCategory
        }
      });
      console.log('API Response:', response.data);
      
      // Ensure we have valid polls data
      const pollsData = response.data?.polls || [];
      if (!Array.isArray(pollsData)) {
        console.error('Invalid polls data format:', pollsData);
        setPolls([]);
        return;
      }

      // Transform and validate each poll object
      const validPolls = pollsData.map(poll => ({
        pollId: poll._id || poll.pollId,
        topic: poll.topic || '',
        description: poll.description || '',
        question: poll.question || '',
        options: poll.options || {},
        votes: poll.votes || {},
        userVotes: poll.userVotes || {},
        category: poll.category || 'General',
        endDate: poll.endDate || new Date().toISOString()
      })).filter(poll => poll.pollId && poll.question); // Only include polls with required fields

      setPolls(validPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast.error('Failed to load polls');
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (updatedPoll) => {
    console.log('Updating poll:', updatedPoll);
    setPolls(prev => prev.map(poll => {
      if (poll.pollId === updatedPoll.pollId) {
        return {
          ...poll,
          votes: updatedPoll.votes,
          userVotes: {
            ...poll.userVotes,
            ...updatedPoll.userVotes
          }
        };
      }
      return poll;
    }));
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-poppins relative overflow-x-hidden" style={{ backgroundImage: 'url("/src/pages/assets/bg.jpg")', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      {/* Deb8 Logo and Navigation */}
      <header className="relative z-10 flex items-center justify-between px-8 pt-8 pb-4 bg-gradient-to-br from-[#1a223d] via-[#233D7B] to-[#2e3a5a] rounded-b-3xl md:rounded-b-[3rem] shadow-2xl">
        <div className="flex items-center text-3xl font-bold font-grotesk cursor-pointer" onClick={() => navigate('/home')}>
          <span className="text-[#233D7B] bg-white px-2 py-1 rounded-lg">Deb</span><span className="text-[#FB790B]">8</span>
        </div>
        <div className="flex items-center gap-6 ml-auto">
          <nav className="flex items-center gap-12 font-poppins text-lg font-bold">
            <span onClick={() => navigate('/create?type=poll')} className="cursor-pointer text-white hover:text-[#FB790B] transition flex items-center gap-2">
              <Plus className="w-6 h-6 text-white" /> Create Poll
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
              <h1 className="text-3xl font-bold text-gray-900">Live Polls</h1>
              <button
                onClick={() => navigate('/create?type=poll')}
                className="flex items-center px-4 py-2 bg-[#FB790B] text-white rounded-lg font-bold hover:bg-[#e06d00] transition-colors shadow"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Poll
              </button>
            </div>
            <p className="text-gray-600">Participate in live polls and share your opinion</p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All' ? 'All Polls' : cat)}
                className={`px-4 py-2 rounded-lg font-medium border transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FB790B] ${
                  selectedCategory === (cat === 'All' ? 'All Polls' : cat)
                    ? 'bg-white text-[#233D7B] border-[#FB790B] font-bold shadow'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#233D7B] hover:text-[#233D7B]'
                }`}
              >
                {cat === 'All' ? 'All Polls' : cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls..."
              className="w-full px-6 py-3 text-lg rounded-lg bg-white border border-gray-200 focus:border-[#FB790B] focus:ring-2 focus:ring-[#FB790B]"
            />
          </div>

          {/* Polls Grid */}
          {polls.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <BarChart2 className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No live polls at the moment</h3>
              <p className="mt-2 text-gray-500">Be the first to create a poll!</p>
              <button
                onClick={() => navigate('/create?type=poll')}
                className="mt-4 flex items-center mx-auto px-6 py-3 bg-[#FB790B] text-white rounded-lg font-bold hover:bg-[#e06d00] transition-colors shadow"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Poll
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {polls
                .filter(poll => {
                  if (!poll || !poll.question) return false;
                  const searchLower = searchQuery.toLowerCase();
                  return (
                    (selectedCategory === 'All Polls' || poll.category === selectedCategory) &&
                    ((poll.topic || '').toLowerCase().includes(searchLower) ||
                    (poll.description || '').toLowerCase().includes(searchLower) ||
                    (poll.question || '').toLowerCase().includes(searchLower))
                  );
                })
                .map(poll => (
                  <PollCard
                    key={poll.pollId}
                    poll={poll}
                    onVote={handleVote}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowsePolls; 