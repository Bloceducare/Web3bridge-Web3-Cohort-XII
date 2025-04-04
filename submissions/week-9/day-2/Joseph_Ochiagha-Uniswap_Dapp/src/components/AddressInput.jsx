// src/components/AddressInput.jsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  InputAdornment,
  IconButton,
  Tooltip,
  Fade,
  useTheme
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SearchIcon from '@mui/icons-material/Search';
import { ethers } from 'ethers';
import { EXAMPLE_PAIR } from '../constants/abis';

const AddressInput = ({ onSubmit, loading }) => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    if (error) setError('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleUseExample = () => {
    setAddress(EXAMPLE_PAIR);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the address
    if (!address) {
      setError('Please enter an address');
      return;
    }
    
    if (!ethers.utils.isAddress(address)) {
      setError('Invalid Ethereum address');
      return;
    }
    
    onSubmit(address);
  };

  return (
    <Fade in timeout={800}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1f2128 0%, #191b1f 100%)' 
            : 'linear-gradient(145deg, #ffffff 0%, #f7f8fa 100%)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 24px rgba(0, 0, 0, 0.45)'
            : '0 4px 24px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          Uniswap V2 Pair Explorer
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3,
            color: theme.palette.text.secondary
          }}
        >
          Enter a Uniswap V2 pair address to view detailed information about the trading pair.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="0x..."
            value={address}
            onChange={handleAddressChange}
            error={!!error}
            helperText={error}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Paste from clipboard">
                    <IconButton 
                      edge="end" 
                      onClick={handlePaste}
                      disabled={loading}
                    >
                      <ContentPasteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.03)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }
            }}
            sx={{ mb: 2 }}
          />
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              mt: 3,
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              size="large"
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                background: 'linear-gradient(90deg, #FF007A 0%, #BC0156 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FF007A 30%, #BC0156 100%)',
                },
                boxShadow: '0 4px 12px rgba(255, 0, 122, 0.3)',
                textTransform: 'none',
                fontWeight: 600
              }}
              startIcon={<SearchIcon />}
            >
              {loading ? 'Loading...' : 'Explore Pair'}
            </Button>
            
            <Button
              onClick={handleUseExample}
              variant="outlined"
              disabled={loading}
              fullWidth
              size="large"
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                borderColor: 'rgba(255, 0, 122, 0.5)',
                color: '#FF007A',
                '&:hover': {
                  borderColor: '#FF007A',
                  background: 'rgba(255, 0, 122, 0.03)',
                },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Use Example (ETH-USDC)
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default AddressInput;