import React from 'react';
import { Send, LogOut } from 'lucide-react';

const FreeForAllRoom = ({ 
  messages, 
  message, 
  setMessage, 
  handleSendMessage, 
  formatDate, 
  messagesEndRef,
  room,
  onLeaveRoom,
  user,
  isConnected
}) => {
  // Use user prop for userId
  const userId = user?.id;

  // Separate current user's messages
  const myMessages = messages.filter(msg => msg.userId === userId);
  const otherMessages = messages.filter(msg => msg.userId !== userId);

  // Define a color palette for usernames
  const usernameColors = [
    'text-red-600',
    'text-blue-600',
    'text-green-600',
    'text-yellow-600',
    'text-purple-600',
    'text-pink-600',
    'text-indigo-600',
    'text-teal-600',
    'text-orange-600',
    'text-cyan-600',
  ];
  // Hash function to pick a color for a username
  const getUsernameColor = (username) => {
    if (!username) return 'text-gray-900';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return usernameColors[Math.abs(hash) % usernameColors.length];
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-0 sm:px-8 py-8 flex flex-col gap-4">
        {messages.map((msg, index) => {
          const isMe = msg.userId === userId;
          const usernameColor = getUsernameColor(msg.username);
          return (
            <div
              key={index}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {/* Left-aligned (other users) */}
              {!isMe && (
                <>
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-base">
                      {msg.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="max-w-lg flex flex-col items-start">
                    <div className="flex items-center mb-1">
                      <span className={`font-semibold text-base mr-2 ${usernameColor}`}>{msg.username}</span>
                      <span className="text-xs text-gray-700">{formatDate(msg.timestamp)}</span>
                    </div>
                    <div className="px-5 py-3 rounded-2xl bg-gray-200 text-black shadow font-medium text-lg">
                      {msg.content}
                    </div>
                  </div>
                </>
              )}
              {/* Right-aligned (current user) */}
              {isMe && (
                <div className="flex items-end max-w-lg">
                  <div className="flex flex-col items-end">
                    <div className="mb-1 w-full flex justify-end">
                      <span className={`font-semibold text-base ml-2 ${usernameColor}`}>You</span>
                      <span className="text-xs text-gray-700 ml-2">{formatDate(msg.timestamp)}</span>
                    </div>
                    <div className="px-5 py-3 rounded-2xl bg-blue-100 text-black shadow font-medium text-lg">
                      {msg.content}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white text-base">
                      {user?.username?.[0]?.toUpperCase() || 'Y'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Bar */}
      <div className="p-6 bg-white border-t border-gray-100">
        {/* Show connection status */}
        {!isConnected && (
          <div className="text-red-500 text-sm mb-2">Connecting to chat...</div>
        )}
        <form
          className="flex items-center space-x-4"
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-5 py-3 border border-gray-200 rounded-2xl shadow focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-lg bg-gray-50"
            autoComplete="off"
          />
          <button
            type="submit"
            className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
            disabled={!isConnected}
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FreeForAllRoom; 