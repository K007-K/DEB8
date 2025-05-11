import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format } from 'date-fns';

const MessageDisplay = ({ messages, formatDate }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1,
      maxHeight: '60vh',
      overflowY: 'auto',
      p: 1
    }}>
      {messages.map((message, index) => (
        <Paper
          key={index}
          elevation={1}
          sx={{
            p: 1.5,
            maxWidth: '80%',
            alignSelf: message.type === 'audience' ? 'flex-start' : 'flex-end',
            backgroundColor: message.type === 'audience' ? 'grey.100' : 'primary.light',
            color: message.type === 'audience' ? 'text.primary' : 'white',
            borderRadius: 2,
            position: 'relative'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {message.sender}
            {message.team && ` (${message.team})`}
          </Typography>
          <Typography variant="body1">{message.content}</Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              textAlign: 'right',
              mt: 0.5,
              opacity: 0.7
            }}
          >
            {formatDate(message.timestamp)}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default MessageDisplay; 