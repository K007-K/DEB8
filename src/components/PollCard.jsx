import React from 'react';
import { Clock, BarChart2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PollCard = ({ poll, onVote, showResults = true }) => {
  const { user } = useAuth();
  
  const handleVote = async (optionId) => {
    if (!poll.pollId) {
      console.error('Invalid poll ID');
      return;
    }

    try {
      console.log('Voting for option:', optionId, typeof optionId);
      console.log('Current poll state:', {
        pollId: poll.pollId,
        votes: poll.votes,
        userVotes: poll.userVotes,
        userId: user.id
      });
      
      const response = await api.post(`/api/polls/${poll.pollId}/vote`, {
        option: optionId,
        userId: user.id
      });
      
      console.log('Vote response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const message = poll.userVotes?.[user.id] === optionId
          ? 'Vote removed successfully!'
          : 'Vote recorded successfully!';
        toast.success(message);
        
        // Create a new poll object with updated vote information
        const updatedPoll = {
          ...poll,
          votes: response.data.poll.votes || {},
          userVotes: response.data.poll.userVotes || {}
        };
        
        console.log('Updated poll state:', {
          votes: updatedPoll.votes,
          userVotes: updatedPoll.userVotes,
          userId: user.id,
          userVote: updatedPoll.userVotes[user.id]
        });
        
        // Call the onVote callback with the updated poll
        if (onVote) {
          onVote(updatedPoll);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      const errorMessage = error.response?.data?.message || 'Failed to record vote';
      toast.error(errorMessage);
    }
  };

  const getTotalVotes = () => {
    if (!poll.votes) return 0;
    return Object.values(poll.votes).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
  };

  const calculatePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((parseInt(votes) / total) * 100);
  };

  const formatTimeLeft = (endDate) => {
    if (!endDate) return 'No end date';
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.length > 0 ? `${parts.join(' ')} left` : 'Less than a minute left';
  };

  if (!poll || !poll.options) {
    return null;
  }

  const totalVotes = getTotalVotes();
  const userVote = user?.id && poll.userVotes ? poll.userVotes[user.id] : undefined;
  const hasVoted = userVote !== undefined;
  const isEnded = new Date(poll.endDate) <= new Date();

  console.log('PollCard render state:', {
    pollId: poll.pollId,
    userId: user?.id,
    userVote,
    hasVoted,
    userVotes: poll.userVotes,
    votes: poll.votes,
    totalVotes
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">{poll.question || 'Untitled Poll'}</h2>
      <div className="space-y-3">
        {Object.entries(poll.options).map(([optionId, optionText]) => {
          const votes = parseInt(poll.votes?.[optionId]) || 0;
          const percentage = calculatePercentage(votes, totalVotes);
          const userVotedForThis = String(userVote) === String(optionId);
          
          console.log('Option render state:', {
            optionId,
            optionText,
            votes,
            userVote,
            userVotedForThis,
            percentage,
            type: {
              optionId: typeof optionId,
              userVote: typeof userVote
            }
          });
          
          return (
            <div key={optionId} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 flex items-center">
                  {optionText}
                  {userVotedForThis && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Your vote
                    </span>
                  )}
                </span>
                {(showResults || hasVoted || isEnded) && (
                  <span className="text-gray-500">{percentage}%</span>
                )}
              </div>
              <div className="relative h-8">
                <div className="absolute w-full h-full bg-gray-100 rounded-full" />
                <div
                  className="absolute h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(showResults || hasVoted || isEnded) ? percentage : 0}%`,
                    backgroundColor: userVotedForThis ? '#10B981' : '#6366F1'
                  }}
                />
                {!isEnded && (
                  <button
                    onClick={() => handleVote(optionId)}
                    className={`absolute w-full h-full rounded-full cursor-pointer transition-opacity ${
                      userVotedForThis 
                        ? 'opacity-20 hover:opacity-30 bg-green-500' 
                        : 'opacity-0 hover:opacity-10 bg-black'
                    }`}
                    aria-label={userVotedForThis ? 'Remove vote' : 'Vote for this option'}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          <span>{totalVotes} votes</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatTimeLeft(poll.endDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default PollCard; 