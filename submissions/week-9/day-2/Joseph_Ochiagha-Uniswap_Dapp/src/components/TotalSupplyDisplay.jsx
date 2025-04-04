// src/components/TotalSupplyDisplay.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme,
  Tooltip,
  Divider
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { formatNumber } from '../utils/formatters';

const TotalSupplyDisplay = ({ totalSupply }) => {
  const theme = useTheme();
  
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
        Liquidity Pool Tokens
        <Tooltip title="The total supply of LP tokens for this pair">
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
        Each LP token represents a share of the liquidity pool
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          my: 4
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(70, 70, 70, 0.6), rgba(40, 40, 40, 0.6))'
              : 'linear-gradient(135deg, rgba(240, 240, 240, 0.6), rgba(220, 220, 220, 0.6))',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            mb: 2
          }}
        >
          <AccountBalanceWalletOutlinedIcon 
            sx={{ 
              fontSize: '2.5rem',
              color: theme.palette.primary.main
            }} 
          />
        </Box>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(90deg, #FF007A 0%, #2172E5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {formatNumber(totalSupply.formatted)}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          Total LP Tokens
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 0.5 }}
        >
          Raw Total Supply
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}
        >
          {totalSupply.raw}
        </Typography>
      </Box>
    </Paper>
  );
};

export default TotalSupplyDisplay;