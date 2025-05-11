import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Clock } from 'lucide-react';

const DebateCard = ({ debate }) => {
  const is2v2 = debate.debateType === '2vs2';
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              debate.status === 'LIVE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {debate.status}
            </span>
            <span className="text-sm text-gray-500">
              Started {formatTimeAgo(debate.startTime || debate.createdAt)}
            </span>
            <span className="inline-block mb-2 px-2 py-1 rounded text-xs bg-indigo-50 text-indigo-700 font-semibold">{debate.category || 'Uncategorized'}</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">{debate.topic}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{debate.description}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-500 text-sm">
          <Users className="w-4 h-4 mr-2" />
          <span>
            {is2v2
              ? `Team1: ${(debate.team1?.members?.length || 0)} | Team2: ${(debate.team2?.members?.length || 0)}`
              : ''}
          </span>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          <span>{debate.messages?.length || 0} Messages</span>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>{debate.debateType || 'Standard'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {debate.participants && debate.participants.length > 0 && debate.participants.slice(0, 3).map((participant, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                title={participant.username}
              >
                {participant.username[0].toUpperCase()}
              </div>
            ))}
          </div>
          {debate.participants && debate.participants.length > 3 && (
            <span className="text-gray-500 text-sm">
              +{debate.participants.length - 3} more
            </span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-sm mb-2">Room ID: {debate.roomId}</span>
          <button
            onClick={() => navigate(`/room/${debate.roomId}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Join Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DebateCard; 