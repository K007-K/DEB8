import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, BarChart2, Plus, Minus, Users, ArrowRight, Lock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { categories } from './categories';

function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    format: '',
    category: 'General',
    debateType: '2vs2',
    teamA: { name: '', context: '' },
    teamB: { name: '', context: '' },
    timePerSpeaker: 120,
    pollOptions: ['', ''],
    pollExpiration: '3600',
    maxDebaters: 4,
    isPrivate: false,
    password: '',
    pollDurationUnit: 'hours'
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');

    if (type === 'debate') {
      setFormData(prev => ({ ...prev, format: 'fight' }));
      setCurrentStep(2);
    } else if (type === 'poll') {
      setFormData(prev => ({ ...prev, format: 'poll', pollOptions: ['', ''] }));
      setCurrentStep(2);
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTeamChange = (team, field, value) => {
    setFormData(prev => ({
      ...prev,
      [team]: { ...prev[team], [field]: value }
    }));
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...formData.pollOptions];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, pollOptions: newOptions }));
  };

  const addPollOption = () => {
    if (formData.pollOptions.length < 6) {
      setFormData(prev => ({
        ...prev,
        pollOptions: [...prev.pollOptions, '']
      }));
    }
  };

  const removePollOption = (index) => {
    if (formData.pollOptions.length > 2) {
      const newOptions = formData.pollOptions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, pollOptions: newOptions }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        toast.error('Please login to create');
        navigate('/auth?mode=login');
        return;
      }

      setLoading(true);
      let requestData;

      if (formData.format === 'poll') {
        const validOptions = formData.pollOptions.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          toast.error('Please provide at least 2 valid poll options');
          setLoading(false);
          return;
        }

        requestData = {
          question: formData.topic,
          options: validOptions,
          category: formData.category,
          endDate: new Date(Date.now() + parseInt(formData.pollExpiration) * 1000).toISOString()
        };

        await api.post('/api/polls', requestData);
        toast.success('Poll created successfully!');
        navigate('/polls');

      } else {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        requestData = {
          roomId,
          topic: formData.topic,
          description: formData.description,
          category: formData.category,
          format: 'debate',
          debateType: formData.debateType,
          status: 'LIVE',
          createdBy: user.id,
          participants: [{
            userId: user.id,
            username: user.username,
            role: 'debater',
            team: null,
            joinedAt: new Date()
          }],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isPrivate: formData.isPrivate || false,
          votes: [],
          userVotes: {},
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        if (formData.debateType === '2vs2') {
          requestData.team1 = {
            name: formData.teamA.name,
            description: formData.teamA.context,
            members: [],
            maxDebaters: formData.maxDebaters || 2
          };
          requestData.team2 = {
            name: formData.teamB.name,
            description: formData.teamB.context,
            members: [],
            maxDebaters: formData.maxDebaters || 2
          };
        }

        if (formData.isPrivate && formData.password) {
          requestData.password = formData.password;
        }

        const response = await api.post('/api/rooms', requestData);

        if (response.data.success) {
          toast.success('Debate room created successfully!');
          navigate(`/room/${response.data.roomId}`);
        } else {
          throw new Error(response.data.error || 'Failed to create room');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 2:
        if (formData.format === 'poll') {
          return formData.topic.trim() && formData.pollOptions.filter(opt => opt.trim()).length >= 2;
        }
        return formData.topic.trim() && formData.description.trim();
      case 3:
        if (formData.format === 'fight' && formData.debateType === '2vs2') {
          return formData.teamA.name.trim() && formData.teamA.context.trim() &&
                 formData.teamB.name.trim() && formData.teamB.context.trim();
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleFormatSelect = (format) => {
    setFormData(prev => ({
      ...prev,
      format,
      pollOptions: format === 'poll' ? ['', ''] : prev.pollOptions
    }));
    setCurrentStep(2);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative z-10 font-sans mt-8">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.08] rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden"
      >
        {/* Progress Dots */}
        {formData.format && (
          <div className="flex justify-center items-center gap-3 mb-10">
            {[2, 3, formData.format === 'fight' ? 4 : null].filter(Boolean).map((step, idx) => (
              <React.Fragment key={step}>
                {idx > 0 && (
                  <div className={`h-1 w-12 rounded-full transition-colors duration-500 ${currentStep >= step ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`} />
                )}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                    currentStep === step 
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(251,121,11,0.5)] scale-110' 
                      : currentStep > step 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30'
                  }`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step - 1}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Create Room</h1>
                <p className="text-lg text-slate-600 dark:text-white/60 font-medium">What would you like to build today?</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => handleFormatSelect('fight')}
                  className="group relative bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-left hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-[0_8px_30px_rgba(251,121,11,0.2)]"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Debate Arena</h3>
                  <p className="text-sm text-slate-500 dark:text-white/50 font-medium leading-relaxed">Create a live text debate. Choose between team battles or free-for-all discussions.</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFormatSelect('poll')}
                  className="group relative bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-left hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]"
                >
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BarChart2 className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">Poll Room</h3>
                  <p className="text-sm text-slate-500 dark:text-white/50 font-medium leading-relaxed">Create a real-time poll where participants can vote and shape public opinion.</p>
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  {formData.format === 'poll' ? 'Design Your Poll' : 'Configure Arena'}
                </h1>
                <p className="text-slate-600 dark:text-white/60 font-medium">Let's start with the basics.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-white/80 mb-2">
                    {formData.format === 'poll' ? 'Poll Question*' : 'Debate Topic*'}
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                    placeholder={formData.format === 'poll' ? 'e.g. Best programming language?' : 'e.g. AI vs Human Creativity'}
                    required
                  />
                </div>

                {formData.format !== 'poll' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-white/80 mb-2">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium resize-none"
                      placeholder="Provide context for the debate..."
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-white/80 mb-2">
                    Category*
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium appearance-none cursor-pointer"
                      required
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat} className="text-slate-900 bg-white">{cat}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>

                {formData.format === 'poll' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-white/80 mb-2">
                        Options*
                      </label>
                      <div className="space-y-3">
                        {formData.pollOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handlePollOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                              required
                            />
                            {index >= 2 && (
                              <button
                                type="button"
                                onClick={() => removePollOption(index)}
                                className="w-12 h-12 flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {formData.pollOptions.length < 6 && (
                        <button
                          type="button"
                          onClick={addPollOption}
                          className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add Another Option
                        </button>
                      )}
                    </div>
                    
                    <button onClick={handleSubmit} disabled={loading} className="w-full mt-8 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white transition-all shadow-md flex justify-center items-center">
                      {loading ? 'Creating...' : 'Create Poll'}
                    </button>
                  </>
                )}

                {formData.format !== 'poll' && (
                  <button onClick={nextStep} className="w-full mt-8 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(251,121,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(251,121,11,0.5)] transform hover:-translate-y-1 flex justify-center items-center gap-2">
                    Next Step <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && formData.format === 'fight' && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Arena Type</h1>
                <p className="text-slate-600 dark:text-white/60 font-medium">How should the debate be structured?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, debateType: '2vs2' }))}
                  className={`p-6 border rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${
                    formData.debateType === '2vs2'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_0_20px_rgba(251,121,11,0.2)]'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-primary/50'
                  }`}
                >
                  {formData.debateType === '2vs2' && <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse pointer-events-none" />}
                  <div className="flex items-center gap-2 mb-2">
                    <Users className={`w-5 h-5 ${formData.debateType === '2vs2' ? 'text-primary' : 'text-slate-400 dark:text-white/30'}`} />
                    <div className={`font-bold ${formData.debateType === '2vs2' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Team vs Team</div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50 font-medium">Structured team debate with defined sides.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, debateType: 'freeForAll' }))}
                  className={`p-6 border rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${
                    formData.debateType === 'freeForAll'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_0_20px_rgba(251,121,11,0.2)]'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-primary/50'
                  }`}
                >
                  {formData.debateType === 'freeForAll' && <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse pointer-events-none" />}
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className={`w-5 h-5 ${formData.debateType === 'freeForAll' ? 'text-primary' : 'text-slate-400 dark:text-white/30'}`} />
                    <div className={`font-bold ${formData.debateType === 'freeForAll' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Free-for-All</div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50 font-medium">Open chaotic discussion format.</div>
                </button>
              </div>

              {formData.debateType === '2vs2' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4 p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                    <h3 className="font-bold text-slate-900 dark:text-white">Team A</h3>
                    <div>
                      <input
                        type="text"
                        value={formData.teamA.name}
                        onChange={(e) => handleTeamChange('teamA', 'name', e.target.value)}
                        placeholder="Name (e.g. Pro)"
                        className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-900 dark:text-white mb-3"
                        required
                      />
                      <input
                        type="text"
                        value={formData.teamA.context}
                        onChange={(e) => handleTeamChange('teamA', 'context', e.target.value)}
                        placeholder="Context / Stance"
                        className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4 p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                    <h3 className="font-bold text-slate-900 dark:text-white">Team B</h3>
                    <div>
                      <input
                        type="text"
                        value={formData.teamB.name}
                        onChange={(e) => handleTeamChange('teamB', 'name', e.target.value)}
                        placeholder="Name (e.g. Con)"
                        className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-900 dark:text-white mb-3"
                        required
                      />
                      <input
                        type="text"
                        value={formData.teamB.context}
                        onChange={(e) => handleTeamChange('teamB', 'context', e.target.value)}
                        placeholder="Context / Stance"
                        className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <button onClick={nextStep} className="w-full mt-8 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(251,121,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(251,121,11,0.5)] transform hover:-translate-y-1 flex justify-center items-center gap-2">
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {currentStep === 4 && formData.format === 'fight' && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Final Touches</h1>
                <p className="text-slate-600 dark:text-white/60 font-medium">Privacy and access settings.</p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-slate-300 dark:border-white/20 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                      {formData.isPrivate && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-400 dark:text-white/40" />
                      Make Room Private
                    </div>
                    <div className="text-sm text-slate-500 dark:text-white/50 font-medium">Require a password to enter.</div>
                  </div>
                </label>

                <AnimatePresence>
                  {formData.isPrivate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                        placeholder="Enter a secure password..."
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={handleSubmit} disabled={loading} className="w-full mt-8 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all shadow-[0_8px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(251,121,11,0.4)] dark:hover:shadow-[0_0_30px_rgba(251,121,11,0.5)] transform hover:-translate-y-1 flex justify-center items-center gap-2">
                {loading ? 'Creating...' : 'Launch Arena'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default CreateRoom;