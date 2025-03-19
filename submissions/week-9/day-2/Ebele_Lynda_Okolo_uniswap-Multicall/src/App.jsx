import { useState } from 'react';
import { ethers } from 'ethers';
import { createClient, configureChains, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TokenIcon from '@mui/icons-material/Token';

// ABI imports
import ERC20ABI from './abis/ERC20.json';
import UniswapV2PairABI from './abis/UniswapV2Pair.json';
import MulticallABI from './abis/Multicall.json';

// Configure wagmi client
const { provider } = configureChains([mainnet], [publicProvider()]);
const client = createClient({
  provider,
  autoConnect: true,
});

// Addresses
const MULTICALL_ADDRESS = '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696'; // Updated Multicall address

// Custom theme - Dark mode with teal/emerald palette
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00B8A9', // Teal/emerald
      light: '#79E2D7',
      dark: '#008C80',
    },
    secondary: {
      main: '#F8485E', // Coral accent
      light: '#FF7F8E',
      dark: '#D32F40',
    },
    background: {
      default: '#121212', 
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0', // Light text for dark background
      secondary: '#A0A0A0', // Medium gray
    },
    info: {
      main: '#3D84A8', // Ocean blue
    },
    success: {
      main: '#00C49A', // Mint
    },
    warning: {
      main: '#F5A962', // Amber
    },
    error: {
      main: '#F24968', // Coral red
    },
  },
  typography: {
    fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 184, 169, 0.2)',
          }
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #00B8A9 0%, #00D6C6 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #F8485E 0%, #FF7F8E 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: '#1E1E1E',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#292929',
            '&.Mui-focused': {
              backgroundColor: '#2E2E2E',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(`${label} copied to clipboard`);
    setSnackbarOpen(true);
  };

  const resetForm = () => {
    setPairAddress('');
    setPairData(null);
    setError('');
  };

  const fetchPairData = async () => {
    if (!ethers.utils.isAddress(pairAddress)) {
      setError('Invalid Ethereum address. Please enter a valid Ethereum contract address.');
      return;
    }
    
    // Add additional validation to check if the address has code (is a contract)
    const ethersProvider = new ethers.providers.JsonRpcProvider(
      'https://eth-mainnet.public.blastapi.io'
    );
    
    const code = await ethersProvider.getCode(pairAddress);
    if (code === '0x' || code === '0x0') {
      setError('The address provided is not a contract. Please enter a valid Uniswap V2 pair address.');
      return;
    }

    setLoading(true);
    setError('');
    setPairData(null);

    try {
      // We already created the provider above, reuse it

      // Set up multicall contract
      const multicallContract = new ethers.Contract(
        MULTICALL_ADDRESS,
        MulticallABI,
        ethersProvider
      );

      const pairContract = new ethers.Contract(
        pairAddress,
        UniswapV2PairABI,
        ethersProvider
      );

      // Prepare calls for pair data
      const calls = [
        {
          target: pairAddress,
          callData: pairContract.interface.encodeFunctionData('token0'),
        },
        {
          target: pairAddress,
          callData: pairContract.interface.encodeFunctionData('token1'),
        },
        {
          target: pairAddress,
          callData: pairContract.interface.encodeFunctionData('getReserves'),
        },
        {
          target: pairAddress,
          callData: pairContract.interface.encodeFunctionData('totalSupply'),
        },
      ];

      // Try direct contract calls first instead of multicall
      try {
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();
        const reserves = await pairContract.getReserves();
        const totalSupplyBN = await pairContract.totalSupply();
        const totalSupply = ethers.utils.formatUnits(totalSupplyBN, 18);
        
        // Set up token contracts
        const token0Contract = new ethers.Contract(token0Address, ERC20ABI, ethersProvider);
        const token1Contract = new ethers.Contract(token1Address, ERC20ABI, ethersProvider);

      // Token contract setup moved inside try block

      // Prepare calls for token details
      const tokenCalls = [
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData('name'),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData('symbol'),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData('decimals'),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData('name'),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData('symbol'),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData('decimals'),
        },
      ];

      // Execute multicall for token details
      const [tokenBlockNumber, tokenReturnData] = await multicallContract.aggregate(tokenCalls);

      // Decode token results
      const token0Name = token0Contract.interface.decodeFunctionResult('name', tokenReturnData[0])[0];
      const token0Symbol = token0Contract.interface.decodeFunctionResult('symbol', tokenReturnData[1])[0];
      const token0Decimals = token0Contract.interface.decodeFunctionResult('decimals', tokenReturnData[2])[0];
      const token1Name = token1Contract.interface.decodeFunctionResult('name', tokenReturnData[3])[0];
      const token1Symbol = token1Contract.interface.decodeFunctionResult('symbol', tokenReturnData[4])[0];
      const token1Decimals = token1Contract.interface.decodeFunctionResult('decimals', tokenReturnData[5])[0];

      // Process the results
      const formattedReserve0 = ethers.utils.formatUnits(reserves[0], token0Decimals);
      const formattedReserve1 = ethers.utils.formatUnits(reserves[1], token1Decimals);

      setPairData({
        token0: {
          address: token0Address,
          name: token0Name,
          symbol: token0Symbol,
          decimals: token0Decimals.toString(),
          reserve: formattedReserve0,
        },
        token1: {
          address: token1Address,
          name: token1Name,
          symbol: token1Symbol,
          decimals: token1Decimals.toString(),
          reserve: formattedReserve1,
        },
        reserves: {
          reserve0: reserves[0].toString(),
          reserve1: reserves[1].toString(),
          blockTimestampLast: reserves[2].toString(),
        },
        totalSupply,
        lastUpdated: new Date().toLocaleString(),
      });
      } catch (directCallErr) {
        console.error('Error with direct calls, trying fallback method:', directCallErr);
        setError(`Could not fetch pair data: ${directCallErr.message}`);
        return; // Exit the function early to prevent further processing
      }
    } catch (err) {
      console.error('Error fetching pair data:', err);
      setError(`Failed to fetch pair data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPairData();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 4,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 184, 169, 0.05) 0%, rgba(18, 18, 18, 0) 70%)',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box 
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '20%',
                  background: 'linear-gradient(135deg, #00B8A9 0%, #00D6C6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0, 184, 169, 0.2)'
                }}
              >
                <SwapHorizIcon fontSize="large" sx={{ color: 'white' }} />
              </Box>
              <Typography 
                variant="h3" 
                color="text.primary" 
                sx={{ 
                  fontWeight: 700,
                }}
              >
                EtherPairView
              </Typography>
            </Box>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: '1.1rem'
              }}
            >
              Explore and analyze liquidity pairs on the Ethereum network with an advanced multicall interface
            </Typography>
          </Box>

          <Paper 
            elevation={1}
            sx={{ 
              p: 4,
              mb: 4,
              backgroundColor: 'background.paper',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #00B8A9 0%, #00D6C6 50%, #3D84A8 100%)',
              }
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Enter Pair Contract Address"
                    variant="outlined"
                    value={pairAddress}
                    onChange={(e) => setPairAddress(e.target.value)}
                    placeholder="0x..."
                    error={!!error}
                    helperText={error}
                    InputProps={{
                      startAdornment: (
                        <Box 
                          component="span" 
                          sx={{ 
                            mr: 1, 
                            color: 'text.secondary',
                            display: 'flex'
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="#637792"/>
                          </svg>
                        </Box>
                      ),
                      sx: { 
                        color: 'text.primary',
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 3px rgba(0, 184, 169, 0.1)'
                        }
                      }
                    }}
                    InputLabelProps={{
                      sx: { color: 'text.secondary' }
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    sx={{ 
                      height: '56px',
                      boxShadow: '0 4px 14px rgba(0, 184, 169, 0.25)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(0, 184, 169, 0.35)',
                      }
                    }}
                  >
                    {loading ? 'Analyzing...' : 'Explore Pair'}
                  </Button>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={resetForm}
                    startIcon={<RefreshIcon />}
                    sx={{ height: '56px' }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {loading && (
            <Box display="flex" justifyContent="center" my={8}>
              <CircularProgress color="primary" size={60} />
            </Box>
          )}

          {pairData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card 
                sx={{ 
                  mb: 4,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(0, 184, 169, 0.05) 0%, rgba(61, 132, 168, 0.05) 100%)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      mb: 3
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      color="text.primary"
                      sx={{ mb: { xs: 2, sm: 0 } }}
                    >
                      Liquidity Pair Overview
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#637792"/>
                        </svg>
                      </Box>
                      Last updated: {pairData.lastUpdated}
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1.5, 
                      mb: 3,
                      alignItems: 'center'
                    }}
                  >
                    <Chip 
                      color="primary" 
                      icon={<SwapHorizIcon />} 
                      label={`${pairData.token0.symbol}/${pairData.token1.symbol} Pair`}
                      sx={{ 
                        fontWeight: 600,
                        py: 1,
                        backgroundColor: 'rgba(0, 184, 169, 0.12)',
                        color: 'primary.dark'
                      }}
                    />
                    <Chip 
                      color="info" 
                      icon={<TokenIcon />} 
                      label={`${Number(pairData.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 4 })} LP Tokens`}
                      sx={{ 
                        fontWeight: 600,
                        py: 1,
                        backgroundColor: 'rgba(61, 132, 168, 0.12)',
                        color: 'info.dark'
                      }}
                    />
                  </Box>
                  
                                      <Box 
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                      This liquidity pair contains {Number(pairData.token0.reserve).toLocaleString(undefined, { maximumFractionDigits: 2 })} {pairData.token0.symbol} and {Number(pairData.token1.reserve).toLocaleString(undefined, { maximumFractionDigits: 2 })} {pairData.token1.symbol}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <TokenCard 
                  token={pairData.token0} 
                  index={0}
                  handleCopy={handleCopy}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TokenCard 
                  token={pairData.token1} 
                  index={1}
                  handleCopy={handleCopy}
                />
              </Grid>

              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    background: '#1E1E1E',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #F8485E 0%, #FF7F8E 100%)',
                          mr: 2,
                          boxShadow: '0 4px 10px rgba(248, 72, 94, 0.2)'
                        }}
                      >
                        <WaterDropIcon sx={{ color: 'white' }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Liquidity Pool Metrics
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 3 }}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="#637792"/>
                            </svg>
                            Pair Contract Address
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              color: 'text.primary',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <Box 
                              component="span" 
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {pairAddress}
                            </Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopy(pairAddress, "Pair address")}
                              sx={{ 
                                ml: 'auto', 
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'secondary.main',
                                  bgcolor: 'rgba(248, 72, 94, 0.08)'
                                }
                              }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ mb: 1 }}
                          >
                            Total LP Supply
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(248, 72, 94, 0.1)',
                              border: '1px solid rgba(248, 72, 94, 0.2)',
                              fontSize: '1rem',
                              fontWeight: 500,
                              color: 'text.primary',
                            }}
                          >
                            {Number(pairData.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopy(pairData.totalSupply, "Total supply")}
                              sx={{ 
                                ml: 'auto', 
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'secondary.main',
                                  bgcolor: 'rgba(248, 72, 94, 0.08)'
                                }
                              }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            sx={{ mb: 1 }}
                          >
                            Last Block Update
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              fontSize: '0.9rem',
                              color: 'text.primary',
                            }}
                          >
                            {new Date(parseInt(pairData.reserves.blockTimestampLast) * 1000).toLocaleString()}
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box 
                          sx={{ 
                            p: 3, 
                            bgcolor: 'rgba(248, 72, 94, 0.1)', 
                            borderRadius: 3, 
                            mb: 2,
                            height: 'calc(100% - 16px)',
                            border: '1px solid rgba(248, 72, 94, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color="secondary.dark" 
                            gutterBottom
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              pb: 2,
                              borderBottom: '1px solid rgba(248, 72, 94, 0.3)',
                              mb: 3
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 9H20L12 17L4 9Z" fill="#F24968"/>
                            </svg>
                            Pool Composition
                          </Typography>
                          
                          <Box 
                            sx={{ 
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 3,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'rgba(0, 184, 169, 0.1)',
                                border: '1px solid rgba(0, 184, 169, 0.2)',
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                {pairData.token0.symbol}:
                              </Typography>
                              <Typography variant="body1" color="text.primary" fontWeight={500}>
                                {Number(pairData.token0.reserve).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                              </Typography>
                            </Box>
                            
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'rgba(61, 132, 168, 0.1)',
                                border: '1px solid rgba(61, 132, 168, 0.2)',
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                {pairData.token1.symbol}:
                              </Typography>
                              <Typography variant="body1" color="text.primary" fontWeight={500}>
                                {Number(pairData.token1.reserve).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success">
            {copiedText}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

// Helper components
function TokenCard({ token, index, handleCopy }) {
  // New dark mode design using teal/emerald and coral colors
  const colors = index === 0 
    ? {
        accent: '#00B8A9',
        background: 'linear-gradient(135deg, rgba(0, 184, 169, 0.1) 0%, rgba(0, 214, 198, 0.05) 100%)',
        boxShadow: '0 4px 20px rgba(0, 184, 169, 0.15)',
        borderAccent: '1px solid rgba(0, 184, 169, 0.3)',
        icon: 'linear-gradient(135deg, #00B8A9 0%, #00D6C6 100%)'
      }
    : {
        accent: '#3D84A8',
        background: 'linear-gradient(135deg, rgba(61, 132, 168, 0.1) 0%, rgba(85, 165, 207, 0.05) 100%)',
        boxShadow: '0 4px 20px rgba(61, 132, 168, 0.15)',
        borderAccent: '1px solid rgba(61, 132, 168, 0.3)',
        icon: 'linear-gradient(135deg, #3D84A8 0%, #55A5CF 100%)'
      };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        background: colors.background,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        border: colors.borderAccent,
        backgroundColor: 'background.paper',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: colors.icon,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              width: '100%'
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: colors.icon,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: `0 4px 10px rgba(0, 0, 0, 0.3)`
              }}
            >
              {token.symbol.charAt(0)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                {token.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="span" 
                  sx={{ 
                    px: 1, 
                    py: 0.2, 
                    bgcolor: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    mr: 1
                  }}
                >
                  {token.symbol}
                </Box>
                <Box component="span" sx={{ fontSize: '0.8rem' }}>
                  {token.decimals} decimals
                </Box>
              </Typography>
            </Box>
          </Box>
          
          <Box 
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              p: 2,
              borderRadius: 2,
              width: '100%',
              mb: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Current Reserve
            </Typography>
            <Typography 
              variant="h6" 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              {Number(token.reserve).toLocaleString(undefined, { maximumFractionDigits: 6 })}
              <Typography 
                component="span" 
                sx={{ 
                  ml: 1, 
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: colors.accent
                }}
              >
                {token.symbol}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleCopy(token.reserve, `${token.symbol} reserve`)}
                sx={{ 
                  ml: 'auto', 
                  color: 'text.secondary',
                  '&:hover': {
                    color: colors.accent,
                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Typography>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="#A0A0A0"/>
              </svg>
              Token Address
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: 'text.primary',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {token.address}
              </Box>
              <IconButton 
                size="small" 
                onClick={() => handleCopy(token.address, `${token.symbol} address`)}
                sx={{ 
                  ml: 'auto', 
                  color: 'text.secondary',
                  '&:hover': {
                    color: colors.accent,
                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}


function DataItem({ label, value, handleCopy }) {
  return (
    <Box mb={2}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Box display="flex" alignItems="center">
        <Typography 
          variant="body2" 
          color="text.primary" 
          sx={{ 
            wordBreak: 'break-all',
            mr: 1
          }}
        >
          {value}
        </Typography>
        {handleCopy && (
          <IconButton 
            size="small" 
            onClick={handleCopy}
            sx={{ color: 'text.secondary' }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default App;