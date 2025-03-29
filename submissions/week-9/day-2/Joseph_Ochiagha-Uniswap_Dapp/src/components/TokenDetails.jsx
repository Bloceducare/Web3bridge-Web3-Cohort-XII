// src/components/TokenDetails.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Chip,
  Link,
  useTheme,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatNumber, shortenAddress } from '../utils/formatters';

const TokenDetails = ({ token, reserves, price, isToken0 }) => {
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.address}/logo.png`}
          alt={token.symbol}
          sx={{ 
            width: 36, 
            height: 36, 
            mr: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            background: theme.palette.mode === 'dark' ? '#333' : '#eee'
          }}
        />
        
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {token.symbol}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {token.name}
          </Typography>
        </Box>
        
        <Chip 
          label={isToken0 ? "Token 0" : "Token 1"} 
          size="small"
          sx={{ 
            ml: 'auto',
            background: isToken0 
              ? 'linear-gradient(90deg, #2172E5 0%, #1552B3 100%)'
              : 'linear-gradient(90deg, #FF007A 0%, #BC0156 100%)',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.7rem',
            height: 20
          }}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Token Address
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.85rem' }}>
            {shortenAddress(token.address)}
          </Typography>
          
          <Link 
            href={`https://etherscan.io/token/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              ml: 1,
              fontSize: '0.75rem',
              opacity: 0.8,
              '&:hover': { opacity: 1 }
            }}
          >
            View
          </Link>
        </Box>
      </Box>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 0.5
            }}
          >
            Price
            <Tooltip 
              title={isToken0 
                ? `1 ${token.symbol} = ${formatNumber(price)} ${token.symbol === "WETH" ? "ETH" : token.symbol}`
                : `1 ${token.symbol} = ${formatNumber(price)} ${token.symbol === "WETH" ? "ETH" : token.symbol}`
              }
            >
              <InfoOutlinedIcon 
                fontSize="inherit" 
                sx={{ ml: 0.5, opacity: 0.7, fontSize: '1rem' }} 
              />
            </Tooltip>
          </Typography>
          
          <Typography sx={{ fontWeight: 600 }}>
            {formatNumber(price, token.decimals)}
          </Typography>
        </Box>
        
        <Box>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 0.5 }}
          >
            Token Decimals
          </Typography>
          
          <Typography sx={{ fontWeight: 600 }}>
            {token.decimals}
          </Typography>
        </Box>
        
        <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 0.5 }}
          >
            Reserves
          </Typography>
          
          <Typography sx={{ fontWeight: 600 }}>
            {formatNumber(reserves, token.decimals)} {token.symbol}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TokenDetails;