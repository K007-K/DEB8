const handleVote = (updatedPoll) => {
  setPolls(prev => prev.map(poll => {
    if (poll.pollId === updatedPoll.pollId) {
      return {
        ...poll,
        votes: updatedPoll.votes,
        userVotes: updatedPoll.userVotes
      };
    }
    return poll;
  }));
}; 