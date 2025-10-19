import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Plus } from 'lucide-react';
import api from '../api/axios';
import PollCard from './PollCard';

function MyPolls() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPolls = async () => {
      try {
        const response = await api.get('/api/polls/my-polls');
        setPolls(response.data.polls);
      } catch (error) {
        console.error('Error fetching my polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPolls();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart2 className="w-6 h-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">My Polls</h2>
        </div>
        <button
          onClick={() => navigate('/create?type=poll')}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Poll
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12">
          <BarChart2 className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No polls yet</h3>
          <p className="mt-2 text-gray-500">Create your first poll to get started!</p>
          <button
            onClick={() => navigate('/create?type=poll')}
            className="mt-4 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Poll
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map(poll => (
            <PollCard
              key={poll.pollId}
              poll={poll}
              showResults={true}
              onVote={(updatedPoll) => {
                console.log('Updating poll:', updatedPoll);
                setPolls(prev => prev.map(p => {
                  if (p.pollId === updatedPoll.pollId) {
                    return {
                      ...p,
                      votes: updatedPoll.votes,
                      userVotes: {
                        ...p.userVotes,
                        ...updatedPoll.userVotes
                      }
                    };
                  }
                  return p;
                }));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPolls; 