import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart2, Edit2, LogOut, Shield, Award, Zap, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [profileData, setProfileData] = useState({
    username: '',
    createdAt: null,
    pollCount: 0,
    pollsParticipatedCount: 0,
    debateCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, debatesRes] = await Promise.all([
          api.get('/api/users/profile'),
          api.get('/api/rooms/my-rooms')
        ]);
        
        const debateData = Array.isArray(debatesRes.data) ? debatesRes.data : [];
        const activeDebates = debateData.filter(room => 
          room.messages && room.messages.some(msg => msg.userId === user.id)
        );

        setProfileData({
          ...profileRes.data,
          debateCount: activeDebates.length
        });
        setNewUsername(profileRes.data.username);
      } catch (error) {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateUsername = async () => {
    try {
      if (!newUsername.trim()) {
        toast.error('Username cannot be empty');
        return;
      }

      await api.put('/api/users/profile', { username: newUsername });
      
      setProfileData(prev => ({ ...prev, username: newUsername }));
      updateUser({ ...user, username: newUsername });
      setIsEditing(false);
      toast.success('Username updated successfully!');
    } catch (error) {
      console.error('Username update error:', error);
      toast.error('Failed to update username');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 relative z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 font-sans">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">My Identity</h1>
          <p className="text-lg text-slate-600 dark:text-white/60 font-medium">
            Manage your profile, stats, and settings.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 dark:hover:bg-red-500 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card (Left) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 space-y-8"
        >
          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] text-center relative overflow-hidden group">
            
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            {/* Glowing Avatar */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse pointer-events-none" />
              <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary to-orange-400">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.username}&backgroundColor=1e293b&textColor=ffffff`}
                  alt="Avatar"
                  className="w-full h-full rounded-full border-4 border-white dark:border-[#020202] object-cover"
                />
              </div>
            </div>

            {/* Name & Editing */}
            <div className="relative z-10">
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdateUsername} className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                      Save
                    </button>
                    <button onClick={() => { setIsEditing(false); setNewUsername(profileData.username); }} className="flex-1 py-2 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profileData.username}</h2>
                  <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 dark:text-white/50 font-medium">
                <Shield className="w-4 h-4" />
                <span>Joined {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Unknown'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bento Stats (Right) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] h-full flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Arenas</h3>
              </div>
              <div>
                <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 group-hover:scale-105 transition-transform origin-left">
                  {profileData.debateCount}
                </div>
                <p className="text-slate-500 dark:text-white/50 font-medium">Debates you've contributed to</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] h-full flex flex-col justify-between group hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Polls Hosted</h3>
              </div>
              <div>
                <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 group-hover:scale-105 transition-transform origin-left">
                  {profileData.pollCount}
                </div>
                <p className="text-slate-500 dark:text-white/50 font-medium">Polls you've created</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2">
            <div className="bg-gradient-to-br from-primary/10 to-orange-400/5 dark:from-primary/20 dark:to-orange-400/10 backdrop-blur-2xl border border-primary/20 dark:border-primary/30 rounded-[2rem] p-8 shadow-lg h-full flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform">
                <Zap className="w-64 h-64 text-primary" />
              </div>
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Influence Score</h3>
              </div>
              <div className="relative z-10">
                <div className="text-6xl font-black text-primary tracking-tighter mb-2">
                  {profileData.pollsParticipatedCount} <span className="text-2xl text-primary/50 tracking-normal">votes</span>
                </div>
                <p className="text-slate-600 dark:text-white/70 font-medium">Total polls you've participated in</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
