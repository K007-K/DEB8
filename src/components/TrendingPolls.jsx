import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PollCard from './PollCard';

const TrendingPolls = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/polls/trending');
      if (response.data && response.data.polls) {
        setPolls(response.data.polls);
      } else {
        setPolls([]);
      }
    } catch (error) {
      console.error('Error fetching trending polls:', error);
      toast.error('Failed to fetch trending polls');
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingPolls();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    polls.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500">No trending polls available</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => (
          <PollCard 
            key={poll.pollId} 
            poll={poll} 
            showResults={true}
            onVote={fetchTrendingPolls}
          />
        ))}
      </div>
    )
  );
};

export default TrendingPolls; 