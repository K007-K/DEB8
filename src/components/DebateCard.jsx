import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Lock, ArrowRight } from 'lucide-react';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function DebateCard({ debate }) {
  const navigate = useNavigate();
  const is2v2 = debate.debateType === '2vs2';

  return (
    <div className="bg-white/70 dark:bg-black/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-transparent backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 font-sans transition-all duration-500 ease-out hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-primary/50 group relative overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
            debate.status === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70'
          }`}>
            {debate.status}
          </span>
          <span className="text-xs text-slate-500 dark:text-white/50 font-medium">
            {formatTimeAgo(debate.startTime || debate.createdAt)}
          </span>
          <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">{debate.category || 'Uncategorized'}</span>
          {debate.isPrivate && (
            <span className="flex items-center gap-1 ml-auto">
              <Lock className="w-3 h-3 text-red-500" />
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {debate.topic}
        </h3>
        <p className="text-sm text-slate-600 dark:text-white/60 mb-4 line-clamp-2">{debate.description}</p>
      </div>

      <div className="relative z-10 space-y-3 mb-6 mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between text-slate-600 dark:text-white/70 text-sm font-medium">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-primary" />
            {is2v2 ? `2v2 Teams` : 'Free For All'}
          </div>
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-primary" />
            {debate.messages?.length || 0} msgs
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center mt-auto">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {debate.participants && debate.participants.length > 0 && debate.participants.slice(0, 3).map((participant, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-[#0f0f0f] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white"
                title={participant.username}
              >
                {participant.username[0].toUpperCase()}
              </div>
            ))}
          </div>
          {debate.participants && debate.participants.length > 3 && (
            <span className="text-slate-500 dark:text-white/50 text-xs font-bold">
              +{debate.participants.length - 3}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate(`/room/${debate.roomId}`)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-110 hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all duration-300 shadow-md"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
