import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, MessageSquare, BarChart2, Edit2, Users, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import HomePageHeader from '../components/HomePageHeader';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: '',
    createdAt: null,
    pollCount: 0,
    pollsParticipatedCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [debateCount, setDebateCount] = useState(0);

  useEffect(() => {
    fetchUserData();
    fetchDebateCount();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setProfileData(response.data);
      setNewUsername(response.data.username);
      setLoading(false);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchDebateCount = async () => {
    try {
      console.log('Fetching debate count for user:', user.id);
      const response = await axios.get('http://localhost:3000/api/rooms/my-rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Debate count response:', response.data);
      
      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error('Response data is not an array:', response.data);
        setDebateCount(0);
        return;
      }

      // Count only debates where the user has sent messages
      const debates = response.data.filter(room => {
        console.log('Full room data:', JSON.stringify(room, null, 2));
        
        // Check if the user has sent any messages in this room
        const hasUserMessages = room.messages && 
                              room.messages.some(message => message.userId === user.id);
        
        console.log('Has user messages:', hasUserMessages);
        return hasUserMessages;
      });

      console.log('Filtered debates:', debates);
      setDebateCount(debates.length);
    } catch (error) {
      console.error('Error fetching debate count:', error);
      console.error('Error response:', error.response?.data);
      setDebateCount(0);
    }
  };

  const handleUpdateUsername = async () => {
    try {
      await axios.put('http://localhost:3000/api/users/profile', 
        { username: newUsername },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      setProfileData(prev => ({ ...prev, username: newUsername }));
      updateUser({ ...user, username: newUsername });
      setIsEditing(false);
      toast.success('Username updated successfully!');
    } catch (error) {
      console.error('Username update error:', error);
      toast.error('Failed to update username');
    }
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.username}`}
                alt="Profile"
                className="w-20 h-20 rounded-full mr-4"
              />
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB790B]"
                        />
                        <button
                          onClick={handleUpdateUsername}
                          className="px-4 py-2 bg-[#FB790B] text-white rounded-lg font-bold hover:bg-[#e06d00] transition-all duration-300 ease-in-out shadow"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setNewUsername(profileData.username);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 ease-in-out"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">{profileData.username}</h2>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-sm text-[#FB790B] hover:text-[#e06d00] transition-all duration-300 ease-in-out"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                    <p className="text-gray-500 mt-1">
                      Joined {new Date(profileData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-xl shadow flex flex-col items-center">
                    <div className="flex items-center text-gray-600 mb-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Debates
                    </div>
                    <p className="text-2xl font-semibold text-[#233D7B]">{debateCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl shadow flex flex-col items-center">
                    <div className="flex items-center text-gray-600 mb-1">
                      <BarChart2 className="w-4 h-4 mr-2" />
                      Active Polls
                    </div>
                    <p className="text-2xl font-semibold text-[#FB790B]">{profileData.pollCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl shadow flex flex-col items-center col-span-2">
                    <div className="flex items-center text-gray-600 mb-1">
                      <BarChart2 className="w-4 h-4 mr-2" />
                      Polls Participated
                    </div>
                    <p className="text-2xl font-semibold text-[#233D7B]">{profileData.pollsParticipatedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;