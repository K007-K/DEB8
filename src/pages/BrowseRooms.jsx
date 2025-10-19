import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Users, ArrowLeft, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function BrowseRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinRoom = async (roomId) => {
    try {
      await axios.post(`/api/rooms/${roomId}/join`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join room');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-800">Browse Debates</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/join-room')}
                className="flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Join by Room ID
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for debate topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No debate rooms found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Create a new room to start a debate'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/create-room')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create New Room
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{room.topic}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{room.participants.length}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        <span>{room.messages?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Created {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {room.roomId}
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.roomId)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Join Debate
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowseRooms;