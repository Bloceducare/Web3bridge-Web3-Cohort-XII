// src/App.jsx
import React, { useState, useMemo } from 'react';
import { 
  CssBaseline, 
  Container, 
  ThemeProvider, 
  createTheme,
  Box, 
  Typography,
  useMediaQuery,
  Alert
} from '@mui/material';
import NavBar from './components/NavBar';
import AddressInput from './components/AddressInput';
import PairCard from './components/PairCard';
import LoadingState from './components/LoadingState';
import { usePairData } from './hooks/usePairData';

function App() {
  // State for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  
  // State for the pair address
  const [pairAddress, setPairAddress] = useState('');
  
  // Fetch pair data
  const { loading, error, data } = usePairData(pairAddress);
  
  // Create the theme based on dark mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#2172E5',
          },
          secondary: {
            main: '#FF007A',
          },
          background: {
            default: darkMode ? '#191b1f' : '#f7f8fa',
            paper: darkMode ? '#212429' : '#ffffff',
          },
        },
        typography: {
          fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [darkMode]
  );
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Handle address submission
  const handleAddressSubmit = (address) => {
    setPairAddress(address);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.background.default,
          backgroundImage: darkMode 
            ? 'radial-gradient(circle at 15% 50%, rgba(33, 114, 229, 0.1) 0%, rgba(33, 36, 41, 0) 25%), radial-gradient(circle at 85% 30%, rgba(255, 0, 122, 0.1) 0%, rgba(33, 36, 41, 0) 25%)'
            : 'radial-gradient(circle at 15% 50%, rgba(33, 114, 229, 0.08) 0%, rgba(255, 255, 255, 0) 25%), radial-gradient(circle at 85% 30%, rgba(255, 0, 122, 0.08) 0%, rgba(255, 255, 255, 0) 25%)',
          py: 3
        }}
      >
        <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <AddressInput onSubmit={handleAddressSubmit} loading={loading} />
          
          {loading && <LoadingState />}
          
          {error && !loading && (
            <Alert 
              severity="error" 
              sx={{ mt: 4, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}
          
          {!loading && !error && data && <PairCard data={data} />}
          
          {!loading && !error && !data && pairAddress && (
            <Alert 
              severity="info" 
              sx={{ mt: 4, borderRadius: 2 }}
            >
              No data found for this pair. Please check the address and try again.
            </Alert>
          )}
        </Container>
        
        <Box 
          component="footer" 
          sx={{ 
            mt: 6, 
            py: 3, 
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Built with Vite, React, Material UI, Ethers.js, and Multicall
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;