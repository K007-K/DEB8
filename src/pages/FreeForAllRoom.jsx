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
  const userId = user?.id;

  // Define a premium color palette for usernames
  const usernameColors = [
    'text-orange-500',
    'text-blue-500',
    'text-green-500',
    'text-purple-500',
    'text-pink-500',
    'text-indigo-500',
    'text-teal-500',
    'text-cyan-500',
  ];
  
  const getUsernameColor = (username) => {
    if (!username) return 'text-slate-900 dark:text-white';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return usernameColors[Math.abs(hash) % usernameColors.length];
  };

  return (
    <div className="flex flex-col h-full w-full relative z-10 font-sans bg-transparent">
      
      {/* Background overlay (if not already handled by parent) */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/20 pointer-events-none -z-10" />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 flex flex-col gap-6 custom-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.userId === userId;
          const usernameColor = getUsernameColor(msg.username);
          
          return (
            <div
              key={index}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              {/* Other users */}
              {!isMe && (
                <div className="flex max-w-[85%] sm:max-w-[70%]">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.username}&backgroundColor=1e293b&textColor=ffffff`}
                      alt={msg.username}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-black/50 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center mb-1.5 px-1">
                      <span className={`font-black text-sm mr-2 ${usernameColor}`}>{msg.username}</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-white/40">{formatDate(msg.timestamp)}</span>
                    </div>
                    <div className="px-5 py-3.5 rounded-[1.5rem] rounded-tl-sm bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-white/90 shadow-sm font-medium leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Current user */}
              {isMe && (
                <div className="flex max-w-[85%] sm:max-w-[70%] justify-end">
                  <div className="flex flex-col items-end">
                    <div className="mb-1.5 px-1 w-full flex justify-end items-center">
                      <span className="text-xs font-medium text-slate-500 dark:text-white/40 mr-2">{formatDate(msg.timestamp)}</span>
                      <span className={`font-black text-sm ${usernameColor}`}>You</span>
                    </div>
                    <div className="px-5 py-3.5 rounded-[1.5rem] rounded-tr-sm bg-primary text-white shadow-[0_4px_15px_rgba(251,121,11,0.25)] border border-primary/20 font-medium leading-relaxed">
                      {msg.content}
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
      <div className="p-4 sm:p-6 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-t border-slate-200/60 dark:border-white/[0.08] shrink-0 relative z-20">
        {!isConnected && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-white/90 text-white dark:text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Connecting to server...
          </div>
        )}
        
        <form
          className="max-w-4xl mx-auto flex items-end gap-3"
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-2xl blur-xl group-focus-within:bg-primary/20 transition-colors pointer-events-none" />
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-6 py-4 bg-white/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none relative z-10"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="p-4 bg-primary text-white rounded-2xl hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-[0_4px_15px_rgba(251,121,11,0.3)] disabled:opacity-50 disabled:hover:translate-y-0 flex-shrink-0"
            disabled={!isConnected || !message.trim()}
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FreeForAllRoom;