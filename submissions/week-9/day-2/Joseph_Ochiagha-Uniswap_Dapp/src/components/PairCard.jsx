// src/components/PairCard.jsx
import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Divider, 
  Chip, 
  Link, 
  Grid,
  Avatar,
  useTheme,
  Fade
} from '@mui/material';
import TokenDetails from './TokenDetails';
import ReservesDisplay from './ReservesDisplay';
import TotalSupplyDisplay from './TotalSupplyDisplay';
import { shortenAddress } from '../utils/formatters';

const PairCard = ({ data }) => {
  const theme = useTheme();
  
  if (!data) return null;
  
  const { token0, token1, reserves, totalSupply, pairAddress, prices } = data;
  
  return (
    <Fade in timeout={500}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4,
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1f2128 0%, #191b1f 100%)' 
            : 'linear-gradient(145deg, #ffffff 0%, #f7f8fa 100%)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 24px rgba(0, 0, 0, 0.45)'
            : '0 4px 24px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background pattern */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0.02,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${theme.palette.mode === 'dark' ? 'ffffff' : '000000'}' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            zIndex: 0
          }}
        />
        
        {/* Pair Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              position: 'relative', 
              mr: 2 
            }}
          >
            <Avatar 
              src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token0.address}/logo.png`}
              alt={token0.symbol}
              sx={{ 
                width: 40, 
                height: 40, 
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme.palette.mode === 'dark' ? '#333' : '#eee'
              }}
            />
            <Avatar 
              src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token1.address}/logo.png`}
              alt={token1.symbol}
              sx={{ 
                width: 40, 
                height: 40, 
                ml: -1.5,
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                background: theme.palette.mode === 'dark' ? '#333' : '#eee'
              }}
            />
          </Box>
          
          <Box>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {token0.symbol}-{token1.symbol} Pair
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mt: 0.5
              }}
            >
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mr: 1 }}
              >
                {shortenAddress(pairAddress)}
              </Typography>
              
              <Link 
                href={`https://etherscan.io/address/${pairAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  fontSize: '0.75rem',
                  opacity: 0.8,
                  '&:hover': { opacity: 1 }
                }}
              >
                View on Etherscan
              </Link>
            </Box>
          </Box>
          
          <Chip 
            label="Uniswap V2" 
            size="small"
            sx={{ 
              ml: 'auto',
              background: 'linear-gradient(90deg, #FF007A 0%, #BC0156 100%)',
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 4, opacity: 0.6 }} />
        
        {/* Pair Details */}
        <Grid container spacing={4}>
          {/* Token Information */}
          <Grid item xs={12} md={6}>
            <TokenDetails token={token0} reserves={reserves.formatted.reserve0} price={prices.price0} isToken0={true} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TokenDetails token={token1} reserves={reserves.formatted.reserve1} price={prices.price1} isToken0={false} />
          </Grid>
          
          {/* Reserves and Liquidity */}
          <Grid item xs={12} md={6}>
            <ReservesDisplay 
              reserves={reserves}
              token0={token0}
              token1={token1}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TotalSupplyDisplay totalSupply={totalSupply} />
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
};

export default PairCard;