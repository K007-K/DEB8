// NOTE: Import these fonts globally in your project for best results:
// <link href="https://fonts.googleapis.com/css?family=Poppins:400,600,700&display=swap" rel="stylesheet" />
// <link href="https://fonts.googleapis.com/css?family=Raleway:400,500,700&display=swap" rel="stylesheet" />
// <link href="https://fonts.googleapis.com/css?family=Playfair+Display:700&display=swap" rel="stylesheet" />
// <link href="https://fonts.googleapis.com/css?family=Abril+Fatface&display=swap" rel="stylesheet" />
// <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,700&display=swap" rel="stylesheet" />
// <link href="https://fonts.googleapis.com/css?family=Rubik:400,500,700&display=swap" rel="stylesheet" />
// <link href="https://fonts.googleapis.com/css?family=Lobster&display=swap" rel="stylesheet" />
// <link href="https://fonts.googleapis.com/css?family=Merriweather:400,700&display=swap" rel="stylesheet" />

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MessageSquare, Users, Globe, TrendingUp, Sparkles, ArrowRight, LogIn, UserPlus, LogOut, User, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { SiReact, SiNodedotjs, SiExpress, SiMongodb, SiSocketdotio, SiTailwindcss } from 'react-icons/si';
import DebateIllustration from './assets/debate-illustration.svg';

function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const heroWords = [
    { word: 'Debate', color: '#FB790B', font: 'Abril Fatface' },
    { word: 'Ideas', color: '#1205AD', font: 'Lobster' },
    { word: 'Community', color: '#7E2B03', font: 'Playfair Display' },
  ];

  // Cycle heroWords every 2.5s
  useState(() => {
    const interval = setInterval(() => {
      setHeroWordIndex((i) => (i + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Hero stats
  const stats = [];

  // Features
  const features = [
    {
      icon: <MessageSquare className="w-8 h-8 text-[#233D7B] mx-auto" />,
      title: 'Real-time Debates',
      desc: 'Engage in live discussions with real-time messaging and argument threading',
    },
    {
      icon: <Users className="w-8 h-8 text-[#233D7B] mx-auto" />,
      title: 'Community Polls',
      desc: 'Create polls to gather opinions and visualize where participants stand',
    },
    {
      icon: <Globe className="w-8 h-8 text-[#233D7B] mx-auto" />,
      title: 'Public Forums',
      desc: 'Join public debate rooms on trending topics and global issues',
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-[#233D7B] mx-auto" />,
      title: 'Private Rooms',
      desc: 'Create invitation-only spaces for focused group discussions',
    },
  ];

  // How it works
  const steps = [
    {
      num: 1,
      title: 'Create Account',
      desc: 'Sign up and personalize your profile with your interests and expertise',
    },
    {
      num: 2,
      title: 'Join or Create Room',
      desc: 'Browse existing debate rooms or create your own on any topic',
    },
    {
      num: 3,
      title: 'Engage in Debate',
      desc: 'Share your perspective, respond to others, and participate in polls',
    },
    {
      num: 4,
      title: 'Grow Your Influence',
      desc: 'Build credibility with thoughtful contributions and expand your network',
    },
  ];

  // Tech stack
  const techStack = [
    { icon: <SiReact className="w-10 h-10 text-[#38bdf8]" />, name: 'React', desc: 'Frontend UI library for building interactive components' },
    { icon: <SiNodedotjs className="w-10 h-10 text-[#3c873a]" />, name: 'Node.js', desc: 'Backend JavaScript runtime for the server environment' },
    { icon: <SiSocketdotio className="w-10 h-10 text-[#000]" />, name: 'Socket.io', desc: 'Real-time bidirectional event-based communication' },
    { icon: <SiMongodb className="w-10 h-10 text-[#10b981]" />, name: 'MongoDB', desc: 'NoSQL database for storing user and debate data' },
    { icon: <SiExpress className="w-10 h-10 text-[#000]" />, name: 'Express.js', desc: 'Web application framework for Node.js' },
    { icon: <SiTailwindcss className="w-10 h-10 text-[#38bdf8]" />, name: 'TailwindCSS', desc: 'Utility-first CSS framework for rapid UI development' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#233D7B] to-[#1a223d] font-poppins text-[#fff]">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col justify-between pb-24 pt-8">
        {/* Floating circles */}
        <div className="absolute inset-0 z-0">
          <div className="absolute left-1/3 top-1/4 w-64 h-64 bg-[#fff]/[0.08] rounded-full blur-2xl" />
          <div className="absolute right-1/4 top-1/3 w-80 h-80 bg-[#fff]/[0.10] rounded-full blur-2xl" />
        </div>
        {/* Header */}
        <header className="flex justify-between items-center px-8 pt-2 z-10 relative">
          <div className="flex items-center text-3xl font-bold font-grotesk">
            <span className="text-[#233D7B] bg-white px-2 py-1 rounded-lg">Deb</span><span className="text-[#FB790B]">8</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/auth?mode=login')} className="px-6 py-2 rounded-md bg-white text-[#233D7B] font-semibold text-lg shadow hover:bg-[#f7fafd] transition font-poppins">Login</button>
            <button onClick={() => navigate('/auth?mode=register')} className="px-6 py-2 rounded-md bg-[#FB790B] text-white font-semibold text-lg shadow hover:bg-[#e06d00] transition font-poppins">Sign Up</button>
          </div>
        </header>
        {/* Hero Content */}
        <motion.div
          className="flex-1 flex flex-col md:flex-row items-center justify-center z-10 relative mt-4 md:mt-0 gap-12 min-h-[60vh]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <div className="flex-1 flex flex-col items-center md:items-start justify-center max-w-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center md:text-left mb-4 font-grotesk">
              Welcome to <span className="text-[#FB790B]">Deb8</span>
            </h1>
            <p className="text-lg md:text-xl text-[#e0e7ef] text-center md:text-left max-w-2xl mb-8 font-poppins">
              The digital platform where ideas clash and minds connect. Create debate rooms, participate in polls, and engage in meaningful discussions.
            </p>
            <div className="flex gap-4 mb-10">
              <button onClick={() => navigate('/home')} className="px-7 py-3 rounded-md bg-[#FB790B] text-white font-semibold text-lg shadow hover:bg-[#e06d00] transition font-poppins">Start Debating</button>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center max-w-lg">
            <img src={DebateIllustration} alt="Debate illustration" className="w-[400px] max-w-full" />
          </div>
        </motion.div>
        {/* Stats Section */}
        <motion.div
          className="flex justify-center gap-8 mt-8 z-10 relative flex-wrap"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="bg-white/80 rounded-2xl shadow p-8 flex flex-col items-center min-w-[160px]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
            >
              <div className="mb-2">{stat.icon}</div>
              <div className="font-bold text-2xl text-[#233D7B]">{stat.value}</div>
              <div className="text-[#233D7B] text-base">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.section
        className="bg-[#f7fafd] py-32 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 font-grotesk">
            <span className="text-[#233D7B]">Platform</span> <span className="text-[#FB790B]">Features</span>
          </h2>
          <p className="text-center text-[#233D7B] text-lg mb-12 font-poppins">Everything you need to engage in meaningful debates and share your perspectives</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
                <div className="mb-4">{f.icon}</div>
                <div className="text-xl font-bold text-[#233D7B] mb-2 font-grotesk">{f.title}</div>
                <div className="text-[#233D7B] text-center font-poppins">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Structured Debate Format Section */}
      <motion.section
        className="bg-[#f7fafd] py-32 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-10 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#233D7B] mb-4 font-grotesk">Structured Debate Format</h2>
            <p className="text-[#233D7B] mb-6 font-poppins">Our platform promotes respectful discourse through structured debate formats that give equal time to different perspectives. Moderate discussions, enforce rules, and maintain a healthy environment for productive conversation.</p>
            <ul className="text-[#233D7B] mb-8 grid grid-cols-1 md:grid-cols-2 gap-2 font-poppins">
              <li className="flex items-center gap-2"><span className="text-[#3b82f6]">✔</span> Timed responses</li>
              <li className="flex items-center gap-2"><span className="text-[#3b82f6]">✔</span> Argument ratings</li>
              <li className="flex items-center gap-2"><span className="text-[#3b82f6]">✔</span> Fact-checking tools</li>
              <li className="flex items-center gap-2"><span className="text-[#3b82f6]">✔</span> Moderation controls</li>
            </ul>
            <div className="bg-gradient-to-br from-[#233D7B] to-[#3b82f6] rounded-xl p-8 text-white shadow flex flex-col items-center font-poppins">
              <div className="text-lg font-bold mb-2">Affirmative <span className="bg-white/20 px-2 py-1 rounded text-xs ml-2">Speaking</span></div>
              <div className="w-full h-2 bg-white/20 rounded mb-4"><div className="h-2 bg-[#FB790B] rounded" style={{ width: '60%' }}></div></div>
              <div className="text-sm mb-2">"The evidence clearly demonstrates that investment in public transportation reduces traffic congestion by up to 21% in urban centers while simultaneously decreasing carbon emissions..."</div>
              <button className="bg-white/20 px-4 py-2 rounded text-xs mt-2 font-poppins">Fact Check</button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How Deb8 Works Section */}
      <motion.section
        className="bg-[#f7fafd] py-32 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 font-grotesk">
            <span className="text-[#233D7B]">How</span> <span className="text-[#FB790B]">Deb8</span> <span className="text-[#233D7B]">Works</span>
          </h2>
          <p className="text-center text-[#233D7B] text-lg mb-12 font-poppins">Get started with Deb8 in just a few simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#233D7B] text-white flex items-center justify-center text-2xl font-bold mb-4 border-2 border-[#FB790B] font-grotesk">{s.num}</div>
                <div className="text-lg font-bold text-[#233D7B] mb-2 font-grotesk">{s.title}</div>
                <div className="text-[#233D7B] text-center font-poppins text-sm">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="bg-gradient-to-br from-[#233D7B] to-[#3b82f6] py-28 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <div className="max-w-4xl mx-auto rounded-2xl p-10 text-center bg-[#233D7B] shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6 font-grotesk">Ready to join the conversation?</h2>
          <p className="text-lg text-white mb-8 font-poppins">Start debating on topics you're passionate about and connect with like-minded individuals.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/auth?mode=register')} className="px-7 py-3 rounded-md bg-[#FB790B] text-white font-semibold text-lg shadow hover:bg-[#e06d00] transition font-poppins">Create Account</button>
          </div>
        </div>
      </motion.section>

      {/* Tech Stack Section */}
      <motion.section
        className="bg-[#f7fafd] py-32 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 font-grotesk">
            <span className="text-[#233D7B]">Our Tech</span> <span className="text-[#FB790B]">Stack</span>
          </h2>
          <p className="text-center text-[#233D7B] text-lg mb-12 font-poppins">Built with modern technologies to ensure performance, security, and scalability</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {techStack.map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="mb-4">{t.icon}</div>
                <div className="text-lg font-bold text-[#233D7B] mb-2 font-grotesk">{t.name}</div>
                <div className="text-[#233D7B] text-center font-poppins text-sm">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-[#233D7B] py-8 px-4 border-t border-[#FB790B] mt-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center text-2xl font-bold font-grotesk">
            <span className="text-[#233D7B] bg-white px-2 py-1 rounded-lg">Deb</span><span className="text-[#FB790B]">8</span>
          </div>
          <div className="text-[#fff] text-base font-poppins">
            © {new Date().getFullYear()} DebateRoom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;