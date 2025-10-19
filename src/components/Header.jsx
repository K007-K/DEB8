import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, LogOut, Plus, Users, BarChart2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateOption = (type) => {
    setShowCreateMenu(false);
    if (type === 'poll') {
      navigate('/create-poll');
    } else {
      navigate(`/create?type=${type}`);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              DebateHub
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => handleCreateOption('debate')}
                    className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Create Debate
                  </button>
                  <button
                    onClick={() => handleCreateOption('poll')}
                    className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    <BarChart2 className="w-5 h-5 mr-2" />
                    Create Poll
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link
                  to="/browse-debates"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Browse Debates
                </Link>
                <Link
                  to="/browse-polls"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Browse Polls
                </Link>
                <Link
                  to="/my-rooms"
                  className="text-gray-600 hover:text-gray-900"
                >
                  My Rooms
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth?mode=login"
                className="text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 