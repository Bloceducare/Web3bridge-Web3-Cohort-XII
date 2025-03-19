// src/components/ReservesDisplay.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  LinearProgress,
  Divider,
  useTheme,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatNumber, formatTimestamp } from '../utils/formatters';

const ReservesDisplay = ({ reserves, token0, token1 }) => {
  const theme = useTheme();
  
  // Calculate percentage for visual representation
  const total = parseFloat(reserves.formatted.reserve0) * parseFloat(token0.decimals) + 
                parseFloat(reserves.formatted.reserve1) * parseFloat(token1.decimals);
  
  const token0Percentage = (parseFloat(reserves.formatted.reserve0) * parseFloat(token0.decimals) / total) * 100;
  const token1Percentage = 100 - token0Percentage;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        background: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.02)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.2)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600,
          mb: 1,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        Pool Reserves
        <Tooltip title="The current reserves of tokens in the liquidity pool">
          <InfoOutlinedIcon 
            fontSize="small" 
            sx={{ ml: 1, opacity: 0.7 }} 
          />
        </Tooltip>
      </Typography>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mb: 3 }}
      >
        Last updated at block timestamp {formatTimestamp(reserves.blockTimestampLast)}
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mb: 1
          }}
        >
          <Typography variant="body2">
            {token0.symbol} ({Math.round(token0Percentage)}%)
          </Typography>
          <Typography variant="body2">
            {token1.symbol} ({Math.round(token1Percentage)}%)
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <Box 
            sx={{ 
              width: `${token0Percentage}%`, 
              background: 'linear-gradient(90deg, #2172E5 0%, #1552B3 100%)',
              transition: 'width 0.5s ease-in-out'
            }} 
          />
          <Box 
            sx={{ 
              width: `${token1Percentage}%`, 
              background: 'linear-gradient(90deg, #FF007A 0%, #BC0156 100%)',
              transition: 'width 0.5s ease-in-out'
            }} 
          />
        </Box>
      </Box>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 0.5 }}
          >
            {token0.symbol} Reserve
          </Typography>
          
          <Typography 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            {formatNumber(reserves.formatted.reserve0, token0.decimals)} {token0.symbol}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5, fontSize: '0.75rem' }}
          >
            Raw: {reserves.reserve0}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 0.5 }}
          >
            {token1.symbol} Reserve
          </Typography>
          
          <Typography 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            {formatNumber(reserves.formatted.reserve1, token1.decimals)} {token1.symbol}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5, fontSize: '0.75rem' }}
          >
            Raw: {reserves.reserve1}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReservesDisplay;