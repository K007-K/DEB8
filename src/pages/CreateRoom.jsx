import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Clock, MessageSquare, Plus, Minus, ArrowRight, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import HomePageHeader from '../components/HomePageHeader';
import { categories } from './categories';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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

  // Get the type from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');

    if (type === 'debate') {
      setFormData(prev => ({
        ...prev,
        format: 'fight'
      }));
      setCurrentStep(2);
    } else if (type === 'poll') {
      setFormData(prev => ({
        ...prev,
        format: 'poll',
        pollOptions: ['', '']
      }));
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
      let requestData;
      
      if (formData.format === 'poll') {
        // Validate poll options
        const validOptions = formData.pollOptions.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          toast.error('Please provide at least 2 valid poll options');
          return;
        }

        // Check if user is logged in
        if (!user) {
          toast.error('Please login to create a poll');
          navigate('/auth?mode=login');
          return;
        }

        // Prepare data for poll creation
        requestData = {
          question: formData.topic,
          options: validOptions,
          category: formData.category,
          endDate: new Date(Date.now() + parseInt(formData.pollExpiration) * 1000).toISOString()
        };

        // Log the request data for debugging
        console.log('Sending request with data:', requestData);

        const response = await api.post('/api/polls', requestData);

        toast.success('Poll created successfully!');
        navigate('/polls');
      } else {
        // Check if user is logged in
        if (!user) {
          toast.error('Please login to create a debate');
          navigate('/auth?mode=login');
          return;
        }

        // Generate a unique room ID
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Prepare data for debate creation
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

        // Add team information for 2vs2 debates
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

        // Only add password if the debate is private
        if (formData.isPrivate && formData.password) {
          requestData.password = formData.password;
        }

        // Log the request data for debugging
        console.log('Sending request with data:', requestData);

        const response = await api.post('/api/rooms', requestData);
        console.log('Server response:', response.data);

        if (response.data.success) {
          toast.success('Debate room created successfully!');
          navigate(`/room/${response.data.roomId}`);
        } else {
          throw new Error(response.data.error || 'Failed to create room');
        }
      }
    } catch (error) {
      console.error(`Error creating ${formData.format === 'poll' ? 'poll' : 'debate room'}:`, error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || `Failed to create ${formData.format === 'poll' ? 'poll' : 'debate room'}`;
      toast.error(errorMessage);
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

  const renderPollForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 transition-all duration-300 ease-in-out"
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poll Question*
        </label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter your question..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="category"
            name="category"
            value={formData.category}
            label="Category"
            onChange={handleChange}
            required
          >
            {categories.filter(c => c !== 'All').map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poll Options* (min 2, max 6)
        </label>
        <div className="space-y-3">
          {formData.pollOptions.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handlePollOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              {index >= 2 && (
                <button
                  type="button"
                  onClick={() => removePollOption(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
            className="mt-3 flex items-center text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Option
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poll Duration
        </label>
        <div className="flex gap-4">
          <select
            name="pollExpiration"
            value={formData.pollExpiration}
            onChange={handleChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {formData.pollDurationUnit === 'hours' ? (
              <>
                <option value="3600">1 hour</option>
                <option value="7200">2 hours</option>
                <option value="14400">4 hours</option>
                <option value="28800">8 hours</option>
                <option value="43200">12 hours</option>
                <option value="86400">24 hours</option>
              </>
            ) : (
              <>
                <option value="86400">1 day</option>
                <option value="172800">2 days</option>
                <option value="259200">3 days</option>
                <option value="432000">5 days</option>
                <option value="604800">7 days (1 week)</option>
                <option value="1209600">14 days (2 weeks)</option>
                <option value="2592000">30 days (1 month)</option>
              </>
            )}
          </select>
          <select
            name="pollDurationUnit"
            value={formData.pollDurationUnit}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    // If format is not selected and we're on step 1, show format selection
    if (currentStep === 1 && !formData.format) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 transition-all duration-300 ease-in-out"
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What would you like to create?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleFormatSelect('fight')}
                className={`p-6 border rounded-lg text-left ${
                  formData.format === 'fight'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
                  <div className="font-medium text-lg">Fight with Words</div>
                </div>
                <div className="text-sm text-gray-600">
                  Create a live text debate between participants. Choose between team debates or free-for-all discussions.
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleFormatSelect('poll')}
                className={`p-6 border rounded-lg text-left ${
                  formData.format === 'poll'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <BarChart2 className="w-6 h-6 mr-2 text-indigo-600" />
                  <div className="font-medium text-lg">Poll Debate</div>
                </div>
                <div className="text-sm text-gray-600">
                  Create a poll-based debate where participants can vote and discuss their choices.
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    // If it's a poll, show the poll form
    if (formData.format === 'poll') {
      return renderPollForm();
    }

    // For debates, show the multi-step form
    switch (currentStep) {
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 transition-all duration-300 ease-in-out"
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.format === 'poll' ? 'Poll Question*' : 'Debate Title*'}
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={formData.format === 'poll' ? 'Enter your question...' : 'Make it clear and engaging'}
                required
              />
            </div>

            {formData.format !== 'poll' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Provide context and what you hope to discuss"
                  required
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category*
              </label>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                  required
                >
                  {categories.filter(c => c !== 'All').map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </motion.div>
        );

      case 3:
        if (formData.format === 'fight') {
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 transition-all duration-300 ease-in-out"
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Debate Type*
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, debateType: '2vs2' }))}
                    className={`p-4 border rounded-lg text-left ${
                      formData.debateType === '2vs2'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium mb-1">Team vs Team</div>
                    <div className="text-sm text-gray-600">
                      Structured team debate
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, debateType: 'freeForAll' }))}
                    className={`p-4 border rounded-lg text-left ${
                      formData.debateType === 'freeForAll'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium mb-1">Free-for-All</div>
                    <div className="text-sm text-gray-600">
                      Open discussion format
                    </div>
                  </button>
                </div>
              </div>

              {formData.debateType === '2vs2' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Team A</h3>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Team Name*
                        </label>
                        <input
                          type="text"
                          value={formData.teamA.name}
                          onChange={(e) => handleTeamChange('teamA', 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Context*
                        </label>
                        <textarea
                          value={formData.teamA.context}
                          onChange={(e) => handleTeamChange('teamA', 'context', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows="3"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Team B</h3>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Team Name*
                        </label>
                        <input
                          type="text"
                          value={formData.teamB.name}
                          onChange={(e) => handleTeamChange('teamB', 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Context*
                        </label>
                        <textarea
                          value={formData.teamB.context}
                          onChange={(e) => handleTeamChange('teamB', 'context', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows="3"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Debaters per Team
                    </label>
                    <input
                      type="number"
                      name="maxDebaters"
                      min="1"
                      placeholder="Enter number or leave blank for no limit"
                      value={formData.maxDebaters === '' ? '' : formData.maxDebaters}
                      onChange={e => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          maxDebaters: value === '' ? '' : Math.max(1, parseInt(value))
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="noLimit"
                        checked={formData.maxDebaters === ''}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, maxDebaters: e.target.checked ? '' : 4 }));
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="noLimit" className="text-sm text-gray-600">No Limit</label>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          );
        }

        return null;

      case 4:
        if (formData.format === 'poll') {
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 transition-all duration-300 ease-in-out"
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Make this room private
                  </label>
                </div>

                {formData.isPrivate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Password*
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter room password"
                      required
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 transition-all duration-300 ease-in-out"
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <div>
              <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Make this room private
                    </label>
                  </div>

                  {formData.isPrivate && (
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Password*
                  </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter room password"
                        required
                      />
                    </div>
                  )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-center text-gray-900">
              Create New {formData.format === 'poll' ? 'Poll' : 'Debate'}
            </h1>
            <div className="w-20"></div>
          </div>

          {/* Progress Steps - Only show for debates */}
          {formData.format === 'fight' && (
            <div className="flex justify-between mb-8">
              {['Format', 'Basic Info', 'Setup', 'Settings'].map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center ${
                    index < 3 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index + 1 === currentStep
                        ? 'bg-indigo-600 text-white'
                        : index + 1 < currentStep
                        ? 'bg-indigo-200 text-indigo-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      index + 1 < currentStep ? 'bg-indigo-200' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            )}

          {/* Form */}
          <div className="space-y-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-end pt-6">
              {formData.format === 'fight' && currentStep > 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>
              )}
              {formData.format === 'fight' && currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-auto"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-auto disabled:opacity-50"
                >
                  {loading ? 'Creating...' : `Create ${formData.format === 'poll' ? 'Poll' : 'Room'}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRoom; 