import React from 'react';
import { Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function PollCard({ poll, onVote, showResults = true }) {
  const { user } = useAuth();
  
  const handleVote = async (optionId) => {
    if (!poll.pollId) return;

    try {
      const response = await api.post(`/api/polls/${poll.pollId}/vote`, {
        option: optionId,
        userId: user.id
      });
      
      if (response.data.success) {
        const message = poll.userVotes?.[user.id] === optionId
          ? 'Vote removed successfully!'
          : 'Vote recorded successfully!';
        toast.success(message);
        
        const updatedPoll = {
          ...poll,
          votes: response.data.poll.votes || {},
          userVotes: response.data.poll.userVotes || {}
        };
        
        if (onVote) onVote(updatedPoll);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.message || 'Failed to record vote');
    }
  };

  const getTotalVotes = () => {
    if (!poll.votes) return 0;
    return Object.values(poll.votes).reduce((sum, count) => sum + (parseInt(count) || 0), 0);
  };

  const calculatePercentage = (votes, total) => {
    if (total === 0) return 0;
    return (parseInt(votes) / total) * 100;
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
    
    return parts.length > 0 ? `${parts.join(' ')} left` : '< 1m left';
  };

  if (!poll || !poll.options) return null;

  const totalVotes = getTotalVotes();
  const userVote = user?.id && poll.userVotes ? poll.userVotes[user.id] : undefined;
  const hasVoted = userVote !== undefined;
  const isEnded = poll.endDate ? new Date(poll.endDate) <= new Date() : false;

  return (
    <div className="bg-white/70 dark:bg-black/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-transparent backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 font-sans transition-all duration-500 ease-out hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-blue-500/50 group relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex-1">
        <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white leading-snug group-hover:text-blue-500 transition-colors duration-300 line-clamp-2">
          {poll.topic || poll.question || 'Untitled Poll'}
        </h3>
        <div className="space-y-4">
          {Object.entries(poll.options).map(([optionId, optionText]) => {
            const votes = parseInt(poll.votes?.[optionId]) || 0;
            const percentage = calculatePercentage(votes, totalVotes);
            const userVotedForThis = String(userVote) === String(optionId);
            
            return (
              <div key={optionId} className="relative group/option">
                <div className="flex justify-between items-center text-sm mb-1.5 font-bold">
                  <span className="text-slate-700 dark:text-white/80 flex items-center gap-2">
                    {optionText}
                    {userVotedForThis && (
                      <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Voted
                      </span>
                    )}
                  </span>
                  {(showResults || hasVoted || isEnded) && (
                    <span className="text-slate-500 dark:text-white/50">{percentage.toFixed(0)}%</span>
                  )}
                </div>
                <div 
                  className="relative h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden shadow-inner cursor-pointer"
                  onClick={() => !isEnded && handleVote(optionId)}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(showResults || hasVoted || isEnded) ? percentage : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${userVotedForThis ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                  />
                  {!isEnded && (
                    <div className={`absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover/option:opacity-100 transition-opacity`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10">
        <div className="flex items-center text-sm font-bold text-slate-500 dark:text-white/50">
          <Users className="w-4 h-4 mr-1.5" />
          {totalVotes} votes
        </div>
        <div className="flex items-center text-sm font-bold text-blue-500">
          <Clock className="w-4 h-4 mr-1.5" />
          {formatTimeLeft(poll.endDate)}
        </div>
      </div>
    </div>
  );
}