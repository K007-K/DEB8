import React, { useRef, useEffect } from 'react';
import { Send, Users, MessageSquare } from 'lucide-react';

const TeamDebateRoom = ({
  room,
  userRole,
  selectedTeam,
  debateMessages,
  audienceMessages,
  message,
  setMessage,
  handleSendMessage,
  formatDate,
  messagesEndRef,
  onLeaveRoom,
  user,
  setRoom,
  setDebateMessages,
  setAudienceMessages,
  isConnected
}) => {
  const userId = user?.id;
  
  const getTeamName = (team) => team === 'team1' ? (room.team1?.name || 'Team A') : (room.team2?.name || 'Team B');
  const getTeamContext = (team) => team === 'team1' ? (room.team1?.description || '') : (room.team2?.description || '');

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debateMessages, audienceMessages]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full relative z-10 font-sans bg-transparent">
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/20 pointer-events-none -z-10" />

      {/* Debate Chat (70%) */}
      <div className="flex flex-col h-1/2 lg:h-full w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-white/10 relative">
        
        {/* Team Headers */}
        <div className="flex w-full justify-between items-center px-4 sm:px-8 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shrink-0 relative z-20">
          
          {/* Team A */}
          <div className="flex flex-col items-start max-w-[45%]">
            <div className="font-black text-indigo-500 text-lg flex flex-wrap items-center gap-2">
              <span className="truncate">{getTeamName('team1')}</span>
              {userRole === 'debater' && selectedTeam === 'team1' && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] uppercase tracking-wider font-black border border-indigo-500/20">You</span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5 line-clamp-1 font-medium">{getTeamContext('team1')}</div>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/50 text-xs font-black uppercase tracking-widest shrink-0">
            VS
          </div>

          {/* Team B */}
          <div className="flex flex-col items-end max-w-[45%] text-right">
            <div className="font-black text-pink-500 text-lg flex flex-wrap-reverse justify-end items-center gap-2">
              {userRole === 'debater' && selectedTeam === 'team2' && (
                <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-500 text-[10px] uppercase tracking-wider font-black border border-pink-500/20">You</span>
              )}
              <span className="truncate">{getTeamName('team2')}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5 line-clamp-1 font-medium">{getTeamContext('team2')}</div>
          </div>
        </div>

        {/* Debate Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar relative z-10">
          <div className="flex flex-col gap-6">
            {debateMessages && debateMessages.length > 0 ? (
              debateMessages.map((msg, index) => {
                const isMe = msg.userId === userId;
                const isTeam1 = msg.team === 'team1';
                
                return (
                  <div key={index} className={`flex w-full ${isTeam1 ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                    
                    {/* Team 1 (Left) */}
                    {isTeam1 && (
                      <div className="flex max-w-[85%] sm:max-w-[75%]">
                        <div className="flex-shrink-0 mr-3 mt-1">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.username}&backgroundColor=4f46e5&textColor=ffffff`}
                            alt={msg.username}
                            className={`w-10 h-10 rounded-full border-2 ${isMe ? 'border-indigo-400' : 'border-white dark:border-indigo-900'} shadow-sm`}
                          />
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center mb-1.5 px-1">
                            <span className="font-black text-sm mr-2 text-indigo-600 dark:text-indigo-400">{msg.username} {isMe && '(You)'}</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-white/40">{formatDate(msg.timestamp)}</span>
                          </div>
                          <div className="px-5 py-3.5 rounded-[1.5rem] rounded-tl-sm bg-white/80 dark:bg-indigo-500/10 backdrop-blur-md border border-indigo-100 dark:border-indigo-500/20 text-slate-800 dark:text-white/90 shadow-sm font-medium leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team 2 (Right) */}
                    {!isTeam1 && (
                      <div className="flex max-w-[85%] sm:max-w-[75%] justify-end">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center mb-1.5 px-1">
                            <span className="text-xs font-medium text-slate-500 dark:text-white/40 mr-2">{formatDate(msg.timestamp)}</span>
                            <span className="font-black text-sm text-pink-600 dark:text-pink-400">{msg.username} {isMe && '(You)'}</span>
                          </div>
                          <div className="px-5 py-3.5 rounded-[1.5rem] rounded-tr-sm bg-white/80 dark:bg-pink-500/10 backdrop-blur-md border border-pink-100 dark:border-pink-500/20 text-slate-800 dark:text-white/90 shadow-sm font-medium leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-3 mt-1">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.username}&backgroundColor=db2777&textColor=ffffff`}
                            alt={msg.username}
                            className={`w-10 h-10 rounded-full border-2 ${isMe ? 'border-pink-400' : 'border-white dark:border-pink-900'} shadow-sm`}
                          />
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-white/30">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <span className="font-medium">No debate messages yet</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Debater Input */}
        {userRole === 'debater' && (
          <div className="p-4 sm:p-6 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border-t border-slate-200/60 dark:border-white/[0.08] shrink-0 relative z-20">
            {!isConnected && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-white/90 text-white dark:text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md animate-pulse">
                Connecting...
              </div>
            )}
            <form
              className="flex items-end gap-3"
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Speak for ${selectedTeam === 'team1' ? getTeamName('team1') : getTeamName('team2')}...`}
                  className={`w-full px-5 py-3.5 bg-white/70 dark:bg-black/40 border ${selectedTeam === 'team1' ? 'focus:ring-indigo-500 border-indigo-100 dark:border-indigo-500/20' : 'focus:ring-pink-500 border-pink-100 dark:border-pink-500/20'} rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:ring-2 focus:border-transparent outline-none font-medium transition-all`}
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className={`p-3.5 text-white rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 ${selectedTeam === 'team1' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20'}`}
                disabled={!isConnected || !message.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Audience Chat (30%) */}
      <div className="flex flex-col h-1/2 lg:h-full w-full lg:w-[30%] bg-white/20 dark:bg-black/40 backdrop-blur-md relative z-10">
        
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-white/10 shrink-0 flex items-center gap-2 bg-white/30 dark:bg-transparent">
          <Users className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Audience</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          <div className="flex flex-col gap-4">
            {audienceMessages && audienceMessages.length > 0 ? (
              audienceMessages.map((msg, index) => (
                <div key={index} className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex-shrink-0 mr-2 mt-1">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.username}&backgroundColor=0ea5e9&textColor=ffffff`}
                      alt={msg.username}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 shadow-sm"
                    />
                  </div>
                  <div className="max-w-[85%] flex flex-col items-start">
                    <div className="flex items-center mb-1 px-1">
                      <span className="font-bold text-xs mr-2 text-slate-700 dark:text-white/80">{msg.username}</span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-white/30">{formatDate(msg.timestamp)}</span>
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-slate-200/50 dark:border-white/5 text-slate-700 dark:text-white/70 text-sm font-medium">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 dark:text-white/30 py-8 text-sm font-medium">
                No audience messages yet
              </div>
            )}
          </div>
        </div>

        {userRole === 'audience' && (
          <div className="p-4 bg-white/40 dark:bg-transparent border-t border-slate-200/60 dark:border-white/10 shrink-0">
            <form
              className="flex items-center gap-2"
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Chat with audience..."
                className="flex-1 px-4 py-2.5 bg-white/70 dark:bg-black/40 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                autoComplete="off"
              />
              <button
                type="submit"
                className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                disabled={!isConnected || !message.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDebateRoom;