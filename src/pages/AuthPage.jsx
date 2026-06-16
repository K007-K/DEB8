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

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#020202] text-slate-900 dark:text-white selection:bg-primary/30 selection:text-white transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto p-8 sm:p-10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-slate-200/60 dark:border-white/[0.08] transition-colors duration-500"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center text-4xl font-black tracking-tighter hover:scale-105 transition-transform duration-300">
            <span className="text-slate-900 dark:text-white transition-colors duration-500">DEB</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FF9900] dark:from-[#FFCC00] dark:to-primary">8</span>
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center tracking-tight transition-colors duration-500">
          {mode === 'login' ? 'Welcome Back' : 'Join the Arena'}
        </h2>
        <p className="text-center text-slate-500 dark:text-white/50 mb-8 text-sm font-light uppercase tracking-widest transition-colors duration-500">
          {mode === 'login' ? 'Enter your credentials' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username"
                className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-slate-300 dark:focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 transition-all duration-300 outline-none shadow-sm dark:shadow-none"
                required
              />
            </div>
          )}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email Address"
              className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-slate-300 dark:focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 transition-all duration-300 outline-none shadow-sm dark:shadow-none"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-slate-300 dark:focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 transition-all duration-300 outline-none shadow-sm dark:shadow-none"
              required
            />
          </div>
          {mode === 'register' && (
            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm Password"
                className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-slate-300 dark:focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 transition-all duration-300 outline-none shadow-sm dark:shadow-none"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-white dark:text-black font-bold bg-slate-900 dark:bg-white hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-[#020202] focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-8 shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(251,121,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(251,121,11,0.5)] transform hover:-translate-y-1"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setFormData({ username: '', email: '', password: '', confirmPassword: '' });
            }}
            className="text-sm text-slate-500 dark:text-white/50 hover:text-primary transition-colors duration-300"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;