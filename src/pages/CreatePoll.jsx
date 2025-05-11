import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import HomePageHeader from '../components/HomePageHeader';
import { Plus, Minus } from 'lucide-react';

function CreatePoll() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    category: 'General',
    duration: 24,
    durationUnit: 'hours'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1) {
      setFormData(prev => ({
        ...prev,
        duration: value
      }));
    }
  };

  const handleDurationUnitChange = (e) => {
    setFormData(prev => ({
      ...prev,
      durationUnit: e.target.value
    }));
  };

  const calculateEndDate = () => {
    const now = new Date();
    const duration = formData.duration;
    const endDate = new Date(now);
    
    if (formData.durationUnit === 'hours') {
      endDate.setHours(now.getHours() + duration);
    } else {
      endDate.setDate(now.getDate() + duration);
    }
    
    return endDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to create a poll');
        navigate('/auth?mode=login');
        return;
      }

      const endDate = calculateEndDate();
      const optionsMap = {};
      formData.options.forEach((option, index) => {
        optionsMap[index] = option;
      });

      const response = await api.post('/api/polls', {
        question: formData.question,
        options: optionsMap,
        category: formData.category,
        endDate: endDate.toISOString()
      });

      if (response.data.success) {
        toast.success('Poll created successfully!');
        navigate('/polls');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setError(error.response?.data?.message || 'Failed to create poll');
      toast.error(error.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomePageHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Poll</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Question*
            </label>
            <input
              type="text"
              id="question"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your question..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options* (min 2, max 6)
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {index >= 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
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
                value={formData.duration}
                onChange={handleDurationChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {formData.durationUnit === 'hours' ? (
                  <>
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={8}>8 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                  </>
                ) : (
                  <>
                    <option value={1}>1 day</option>
                    <option value={2}>2 days</option>
                    <option value={3}>3 days</option>
                    <option value={5}>5 days</option>
                    <option value={7}>7 days (1 week)</option>
                    <option value={14}>14 days (2 weeks)</option>
                    <option value={30}>30 days (1 month)</option>
                  </>
                )}
              </select>
              <select
                value={formData.durationUnit}
                onChange={handleDurationUnitChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Poll will end on {calculateEndDate().toLocaleString()}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePoll; 