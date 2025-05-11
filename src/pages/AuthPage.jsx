import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check URL parameters for mode
    const params = new URLSearchParams(location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'login' || urlMode === 'register') {
      setMode(urlMode);
    }

    // Redirect if already logged in
    if (user) {
      navigate('/home');
    }
  }, [location, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        const result = await register(formData.username, formData.email, formData.password);
        if (result.success) {
          toast.success('Registration successful!');
          navigate('/home');
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Login successful!');
          navigate('/home');
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#233D7B] to-[#1a223d] font-poppins">
      {/* Floating circles for background, matching landing page */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/3 top-1/4 w-64 h-64 bg-[#fff]/[0.08] rounded-full blur-2xl" />
        <div className="absolute right-1/4 top-1/3 w-80 h-80 bg-[#fff]/[0.10] rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/40 font-poppins">
        {/* Deb8 Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center text-3xl font-bold font-grotesk">
            <span className="text-[#233D7B] bg-white px-2 py-1 rounded-lg">Deb</span><span className="text-[#FB790B]">8</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-[#233D7B] mb-2 text-center drop-shadow-sm font-poppins">
          {mode === 'login' ? 'Sign In to Deb8' : 'Create Your Account'}
        </h2>
        <p className="text-center text-[#233D7B] mb-6 text-base font-medium">
          Your Debate Platform
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-sm font-inter transition-all duration-300 ease-in-out"
              required
            />
          )}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-sm font-inter transition-all duration-300 ease-in-out"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-sm font-inter transition-all duration-300 ease-in-out"
            required
          />
          {mode === 'register' && (
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-sm font-inter transition-all duration-300 ease-in-out"
              required
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-semibold text-white bg-[#FB790B] hover:bg-[#e06d00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB790B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out font-poppins"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
              });
            }}
            className="text-sm text-[#FB790B] hover:text-[#e06d00] font-medium font-poppins transition-all duration-300 ease-in-out"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;