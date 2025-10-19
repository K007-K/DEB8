import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

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
  
  // Debug - inspect props and messages
  useEffect(() => {
    console.log("TeamDebateRoom received props:", { 
      userRole, 
      selectedTeam, 
      debateMessagesCount: debateMessages?.length,
      audienceMessagesCount: audienceMessages?.length,
      userId 
    });
    
    console.log("Debate messages:", debateMessages);
    console.log("Audience messages:", audienceMessages);
  }, [userRole, selectedTeam, debateMessages, audienceMessages, userId]);
  
  const getTeamName = (team) => team === 'team1' ? (room.team1?.name || 'Team A') : (room.team2?.name || 'Team B');
  const getTeamContext = (team) => team === 'team1' ? (room.team1?.description || '') : (room.team2?.description || '');

  const roomRef = useRef(room);
  useEffect(() => { 
    roomRef.current = room; 
    console.log("Room updated in TeamDebateRoom:", room);
  }, [room]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debateMessages, audienceMessages]);

  const handlePasswordCheck = async () => {
    try {
      await api.post(`/api/rooms/${roomId}/join`, {
        password: joinPassword,
        role: 'check',
      });
      setJoinStep(2);
      setJoinError('');
    } catch (error) {
      // Prevent global error handling/log out for this case
      if (error.response?.data?.message === 'Incorrect password') {
        setJoinError('Incorrect password. Please try again.');
        return; // <--- Prevent further error propagation
      } else if (error.response?.data?.message === 'Password is required for this private room') {
        setJoinError('Password is required for this private room.');
        return;
      } else {
        setJoinError(error.response?.data?.message || 'Failed to check password');
        return;
      }
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Debate Chat (70%) */}
      <div className="flex flex-col h-full w-full sm:w-[70%] bg-white">
        {/* Team Names Row (no title/description here) */}
        <div className="flex w-full justify-between items-center px-8 py-4 border-b border-gray-100 bg-white">
          <div className="flex flex-col items-start">
            <div className="font-semibold text-indigo-700 text-lg flex items-center gap-2">
              {getTeamName('team1')}
              {userRole === 'debater' && selectedTeam === 'team1' && (
                <span className="ml-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold shadow">You are on {getTeamName('team1')}</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">{getTeamContext('team1')}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-semibold text-pink-700 text-lg flex items-center gap-2">
              {getTeamName('team2')}
              {userRole === 'debater' && selectedTeam === 'team2' && (
                <span className="ml-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold shadow">You are on {getTeamName('team2')}</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">{getTeamContext('team2')}</div>
          </div>
        </div>
        {/* Conversation-style chat */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <div className="flex flex-col gap-4">
            {debateMessages && debateMessages.length > 0 ? (
              debateMessages.map((msg, index) => {
                const isMe = msg.userId === userId;
                const isTeam1 = msg.team === 'team1';
                return (
                  <div key={index} className={`flex w-full ${isTeam1 ? 'justify-start' : 'justify-end'}`}>
                    {isTeam1 && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg shadow">
                          {msg.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      </div>
                    )}
                    <div className={`max-w-[65%] flex flex-col ${isTeam1 ? 'items-start' : 'items-end'}`}>
                      <div className="flex items-center mb-1">
                        {isTeam1 && (
                          <span className="font-semibold text-indigo-700 text-base mr-2">{msg.username}</span>
                        )}
                        <span className={`text-xs ${isTeam1 ? 'text-indigo-400' : 'text-pink-400'}`}>{formatDate(msg.timestamp)}</span>
                        {!isTeam1 && (
                          <span className="font-semibold text-pink-700 text-base ml-2">{msg.username}</span>
                        )}
                      </div>
                      <div
                        className={`px-5 py-3 rounded-2xl break-words font-medium text-lg shadow-lg ${
                          isTeam1
                            ? (isMe ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' : 'bg-indigo-100 text-indigo-900')
                            : (isMe ? 'bg-gradient-to-br from-pink-500 to-pink-700 text-white' : 'bg-pink-100 text-pink-900')
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                    {!isTeam1 && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center font-bold text-pink-700 text-lg shadow">
                          {msg.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">No debate messages yet</div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {userRole === 'debater' && (
          <div className="p-6 bg-white">
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
                className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
                disabled={!isConnected}
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Audience Chat (30%) */}
      <div className="flex flex-col h-full w-[30%] bg-gray-50 border-l border-gray-100">
        <div className="p-6 bg-white" >
          <h2 className="text-2xl font-bold text-gray-700">Audience Chat</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            {audienceMessages && audienceMessages.length > 0 ? (
              audienceMessages.map((msg, index) => (
                <div key={index} className="flex w-full justify-start">
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg shadow">
                      {msg.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="max-w-[70%] flex flex-col items-start">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-gray-700 text-base mr-2">{msg.username}</span>
                      <span className="text-xs text-gray-400">{formatDate(msg.timestamp)}</span>
                    </div>
                    <div className="px-5 py-3 rounded-2xl break-words font-medium text-lg bg-gray-100 text-gray-800 shadow">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No audience messages yet</div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {userRole === 'audience' && (
          <div className="p-6 bg-white">
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
                className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
                disabled={!isConnected}
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDebateRoom; 