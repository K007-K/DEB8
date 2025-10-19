import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, LogOut, Plus, Users } from 'lucide-react';

function HomePageHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-none border-b border-gray-100" style={{ minHeight: '90px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center text-2xl font-extrabold tracking-tight font-sans"
            style={{ letterSpacing: '0.04em' }}
          >
            <span className="mr-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square w-8 h-8 text-indigo-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"></path></svg>
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">Deb8</span>
          </button>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate('/create')}
            className="text-black hover:text-indigo-700 flex items-center text-lg font-semibold"
          >
            <Plus className="h-6 w-6 mr-1" />
            Create Room
          </button>
          <button
            onClick={() => navigate('/my-rooms')}
            className="text-black hover:text-indigo-700 flex items-center text-lg font-semibold"
          >
            <Users className="h-6 w-6 mr-1" />
            My Rooms
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="ml-2 text-indigo-700 text-lg font-semibold">{user?.username || 'User'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-black hover:text-indigo-700"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HomePageHeader; 