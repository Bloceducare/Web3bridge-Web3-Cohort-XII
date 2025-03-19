import { useState, useEffect } from 'react';
import { useAppContext } from './contexts/appContext';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Paper, 
  Chip, 
  IconButton, 
  Divider, 
  Alert, 
  CircularProgress, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Snackbar,
  Tooltip,
  useTheme,
  createTheme,
  ThemeProvider,
  alpha
} from '@mui/material';
import { 
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Create a blockchain-themed Material UI theme
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#303f9f',
    },
    secondary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#333333',
      secondary: mode === 'dark' ? '#b0b0b0' : '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'dark' 
            ? '0 8px 24px rgba(0, 0, 0, 0.3)' 
            : '0 8px 24px rgba(140, 158, 255, 0.12)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 22px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 8px 16px rgba(63, 81, 181, 0.3)'
              : '0 8px 16px rgba(63, 81, 181, 0.2)',
          },
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
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

// Blockchain network animation component
const BlockchainBackground = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        opacity: isLight ? 0.1 : 0.15,
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 40 0 L 0 0 0 40" 
              fill="none" 
              stroke={theme.palette.primary.main} 
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.1" />
            <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#fade)" />
      </svg>
    </Box>
  );
};

// Hexagon Pattern Component for Card Backgrounds
const HexagonPattern = ({ opacity = 0.05 }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        opacity,
        overflow: 'hidden',
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse">
            <path 
              d="M25,0 L50,14.4 L50,43.4 L25,58 L0,43.4 L0,14.4 Z" 
              fill="none" 
              stroke={theme.palette.primary.main} 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </Box>
  );
};

// Custom Card with Hexagon Pattern background
const PatternCard = ({ title, subtitle, children, action, cardProps }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        ...cardProps?.sx
      }}
      {...cardProps}
    >
      <HexagonPattern />
      {title && (
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="600">
              {title}
            </Typography>
          }
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={action}
          sx={{ position: 'relative', zIndex: 1 }}
        />
      )}
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </CardContent>
    </Card>
  );
};

// Data display component with label and value
const DataDisplay = ({ label, value, variant = "body1", valueProps = {} }) => (
  <Box mb={2}>
    <Typography variant="caption" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant={variant} {...valueProps}>
      {value}
    </Typography>
  </Box>
);

// Address display with copy button
const AddressDisplay = ({ address, label }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Format address for display (shorten if needed)
  const formatAddress = (addr) => {
    if (!addr) return '';
    if (window.innerWidth < 768) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    return addr;
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          borderRadius: 1.5,
          p: 1,
        }}
      >
        <Typography 
          variant="body2" 
          fontFamily="monospace"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {formatAddress(address)}
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <IconButton 
            size="small" 
            onClick={handleCopy}
            color={copied ? "success" : "primary"}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Token display card
const TokenCard = ({ token }) => {
  const theme = useTheme();
  
  return (
    <PatternCard
      title={`${token.name} (${token.symbol})`}
      cardProps={{
        sx: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <AddressDisplay address={token.address} label="Token Address" />
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <DataDisplay 
            label="Decimals" 
            value={token.decimals} 
          />
        </Grid>
        <Grid item xs={6}>
          <DataDisplay 
            label="Reserve" 
            value={token.reserve.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            valueProps={{
              fontWeight: 'medium',
              color: 'primary.main'
            }}
          />
        </Grid>
      </Grid>
    </PatternCard>
  );
};

// Status metric card
const MetricCard = ({ title, value }) => {
  const theme = useTheme();
  
  return (
    <PatternCard>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography 
        variant="h5" 
        fontWeight="600" 
        color="primary.main"
      >
        {value}
      </Typography>
    </PatternCard>
  );
};

function App() {
  const { pairData, loading, error, fetchContractData } = useAppContext();
  const [pairAddress, setPairAddress] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  
  // Use dark theme for blockchain effect
  const theme = createAppTheme('dark');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchContractData(pairAddress);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  const useExampleAddress = (address) => {
    setPairAddress(address);
    fetchContractData(address);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh', 
          bgcolor: 'background.default',
          color: 'text.primary',
          position: 'relative',
        }}
      >
        <BlockchainBackground />
        
        {/* Header */}
        <Box 
          sx={{ 
            backgroundColor: 'primary.dark',
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
          }}
        >
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.2,
              backgroundImage: `radial-gradient(circle at 20% 90%, rgba(255,255,255,0.1) 0%, transparent 20%),
                                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)`,
            }}
          />
          
          <Container maxWidth="lg" sx={{ py: 6, position: 'relative' }}>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              sx={{ 
                color: 'white',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Uniswap V2 Pair Explorer
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mt: 1, 
                color: alpha('#ffffff', 0.8),
                maxWidth: 600
              }}
            >
              Retrieve detailed information about any Uniswap V2 pair using multicall
            </Typography>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* Search Form */}
          <PatternCard cardProps={{ sx: { mb: 4 } }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} md={9}>
                  <TextField
                    label="Uniswap V2 Pair Address"
                    id="pairAddress"
                    value={pairAddress}
                    onChange={(e) => setPairAddress(e.target.value)}
                    placeholder="0x..."
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
                      }
                    }}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading || !pairAddress}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                    }}
                  >
                    {loading ? 'Loading...' : 'Get Pair Data'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </PatternCard>

          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ mb: 4, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Results */}
          {pairData && (
            <Card 
              sx={{ 
                mb: 4, 
                overflow: 'visible',
                borderRadius: 3,
                boxShadow: (theme) => `0 10px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
              }}
            >
              {/* Header */}
              <Box 
                sx={{ 
                  p: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: `radial-gradient(circle at 30% 70%, white 0%, transparent 10%),
                                      radial-gradient(circle at 70% 30%, white 0%, transparent 10%)`,
                  }}
                />
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      sx={{ color: 'white' }}
                    >
                      {pairData.token0.symbol} / {pairData.token1.symbol} Pair
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Chip 
                      label="Uniswap V2" 
                      color="secondary"
                      size="small"
                      sx={{ 
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 2 },
                      }} 
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Pair Address */}
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <AddressDisplay 
                  address={pairData.pairAddress} 
                  label="Pair Contract Address"
                />
              </Box>

              {/* Token Information */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Token Information
                </Typography>
                <Grid container spacing={3}>
                  {/* Token 0 */}
                  <Grid item xs={12} md={6}>
                    <TokenCard token={pairData.token0} />
                  </Grid>

                  {/* Token 1 */}
                  <Grid item xs={12} md={6}>
                    <TokenCard token={pairData.token1} />
                  </Grid>
                </Grid>
              </Box>

              {/* Pair Details */}
              <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Pair Analytics
                </Typography>

                <Grid container spacing={3}>
                  {/* Total Supply */}
                  <Grid item xs={12} md={4}>
                    <MetricCard 
                      title="Total LP Supply" 
                      value={pairData.totalSupply.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    />
                  </Grid>

                  {/* Price Ratio 0/1 */}
                  <Grid item xs={12} md={4}>
                    <MetricCard 
                      title={`Price (${pairData.token0.symbol} per ${pairData.token1.symbol})`}
                      value={(pairData.token1.reserve / pairData.token0.reserve).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    />
                  </Grid>

                  {/* Price Ratio 1/0 */}
                  <Grid item xs={12} md={4}>
                    <MetricCard 
                      title={`Price (${pairData.token1.symbol} per ${pairData.token0.symbol})`}
                      value={(pairData.token0.reserve / pairData.token1.reserve).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    />
                  </Grid>
                </Grid>

                {/* Raw Data */}
                <Box sx={{ mt: 3 }}>
                  <Accordion 
                    sx={{ 
                      background: (theme) => alpha(theme.palette.primary.main, 0.05),
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ px: 2 }}
                    >
                      <Typography fontWeight={500}>Raw Contract Data</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ color: 'text.secondary' }}>
                              Token0 Raw Reserve
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              {pairData.reserves.reserve0}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ color: 'text.secondary' }}>
                              Token1 Raw Reserve
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              {pairData.reserves.reserve1}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ color: 'text.secondary' }}>
                              Total Supply Raw
                            </TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                              {pairData.totalSupplyRaw}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>

              {/* External Links */}
              <Box 
                sx={{ 
                  p: 3, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  href={`https://etherscan.io/address/${pairData.pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<OpenInNewIcon />}
                  size="small"
                >
                  View on Etherscan
                </Button>
              </Box>
            </Card>
          )}

          {/* Empty State */}
          {!pairData && !loading && !error && (
            <PatternCard
              cardProps={{
                sx: {
                  p: 6,
                  textAlign: 'center',
                  mb: 4
                }
              }}
            >
              <Box sx={{ mb: 3 }}>
                <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight="medium">
                No Pair Data
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Enter a Uniswap V2 pair address above to retrieve details
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                href="https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon />}
              >
                Find Uniswap V2 Pairs
              </Button>
            </PatternCard>
          )}

          {/* Example Pairs */}
          <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mt: 6, mb: 2 }}>
            Example Pair Addresses
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PatternCard>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  ETH/USDC
                </Typography>
                <Typography 
                  variant="body2" 
                  fontFamily="monospace" 
                  color="text.secondary" 
                  sx={{ mb: 2 }}
                >
                  0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => useExampleAddress('0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc')}
                  size="small"
                  sx={{
                    background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                  }}
                >
                  Use this address
                </Button>
              </PatternCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <PatternCard>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  WBTC/ETH
                </Typography>
                <Typography 
                  variant="body2" 
                  fontFamily="monospace" 
                  color="text.secondary" 
                  sx={{ mb: 2 }}
                >
                  0xBb2b8038a1640196FbE3e38816F3e67Cba72D940
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => useExampleAddress('0xBb2b8038a1640196FbE3e38816F3e67Cba72D940')}
                  size="small"
                  sx={{
                    background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                  }}
                >
                  Use this address
                </Button>
              </PatternCard>
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            mt: 8, 
            py: 4,
            bgcolor: 'background.paper', 
            borderTop: 1, 
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <HexagonPattern opacity={0.03} />
          <Container maxWidth="lg">
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ position: 'relative', zIndex: 1 }}
            >
              Uniswap V2 Pair Explorer • Built with React, Material UI, Ethers.js, and Multicall
            </Typography>
          </Container>
        </Box>
        
        {/* Snackbar for copy notification */}
        <Snackbar
          open={showCopied}
          autoHideDuration={2000}
          onClose={() => setShowCopied(false)}
          message="Copied to clipboard!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;