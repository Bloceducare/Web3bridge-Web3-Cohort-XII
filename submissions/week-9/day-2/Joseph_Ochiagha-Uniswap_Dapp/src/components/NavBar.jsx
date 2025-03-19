// src/components/NavBar.jsx
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  useTheme,
  Switch,
  Tooltip,
  Button
} from '@mui/material';
import logo from "./../assets/uniswap-logo.svg"
import GitHubIcon from '@mui/icons-material/GitHub';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const NavBar = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  
  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'rgba(25, 27, 31, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <Box
          component="img"
          src={logo}
          alt="Uniswap Logo"
          sx={{ 
            height: 32,
            mr: 1.5,
            filter: theme.palette.mode === 'dark' ? 'invert(0)' : 'none'
          }}
        />
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #FF007A 0%, #2172E5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Uniswap V2 Pair Explorer
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LightModeIcon 
                sx={{ 
                  color: darkMode ? 'rgba(255, 255, 255, 0.5)' : theme.palette.warning.main,
                  transition: 'color 0.3s ease'
                }} 
              />
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="default"
                sx={{
                  mx: 1,
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#191b1f'
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#2172E5'
                  }
                }}
              />
              <DarkModeIcon 
                sx={{ 
                  color: darkMode ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.5)',
                  transition: 'color 0.3s ease'
                }} 
              />
            </Box>
          </Tooltip>
          
          <Tooltip title="View Source Code">
            <IconButton 
              color="inherit" 
              aria-label="GitHub" 
              sx={{ ml: 2 }}
              component="a"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            href="https://app.uniswap.org"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ml: 2,
              borderRadius: 2,
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
            Go to Uniswap
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;