// src/components/LoadingState.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Fade,
  useTheme
} from '@mui/material';

const LoadingState = () => {
  const theme = useTheme();
  
  return (
    <Fade in timeout={500}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          mt: 4,
          borderRadius: 2,
          textAlign: 'center',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1f2128 0%, #191b1f 100%)' 
            : 'linear-gradient(145deg, #ffffff 0%, #f7f8fa 100%)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 24px rgba(0, 0, 0, 0.45)'
            : '0 4px 24px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              mb: 3
            }}
          >
            <CircularProgress 
              size={60} 
              thickness={4} 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? '#FF007A' 
                  : '#FF007A' 
              }} 
            />
            <CircularProgress 
              size={60} 
              thickness={4} 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? '#2172E5' 
                  : '#2172E5',
                position: 'absolute',
                left: 0,
                opacity: 0.5,
                animation: 'pulse 1.5s ease-in-out infinite'
              }} 
            />
          </Box>
          
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              mb: 1
            }}
          >
            Fetching Pair Data
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Using Multicall to retrieve information about this Uniswap V2 pair.
            This may take a moment...
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default LoadingState;