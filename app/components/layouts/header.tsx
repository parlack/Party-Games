import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Select,
  FormControl,
  MenuItem,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { Rocket, User, UserPlus, Globe, Sparkles } from 'lucide-react';
import { useGame } from '../../context/gamecontext';
import { LoginForm } from '../forms/loginform';
import { SignUpForm } from '../forms/signupform';

export const Header: React.FC = () => {
  const { state, setLanguage } = useGame();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
  };

  const texts = {
    es: {
      title: 'Space Party',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      language: 'Idioma',
    },
    en: {
      title: 'Space Party',
      login: 'Login',
      register: 'Register',
      language: 'Language',
    },
  };

  const t = texts[state.language];

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(26, 27, 58, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.1)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                borderRadius: '12px',
                p: 1,
                mr: 2,
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
              }}
            >
              <Rocket size={28} style={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.5rem',
                }}
              >
                {t.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Sparkles size={12} style={{ color: '#06b6d4' }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#06b6d4',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  MULTIPLAYER GAMES
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Language Selector */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={state.language}
                onChange={handleLanguageChange}
                displayEmpty
                sx={{ 
                  color: 'white',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6366f1',
                  },
                  '& .MuiSelect-icon': {
                    color: '#6366f1',
                  },
                }}
              >
                <MenuItem value="es">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🇪🇸</span>
                    <span>ES</span>
                  </Box>
                </MenuItem>
                <MenuItem value="en">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>🇺🇸</span>
                    <span>EN</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                borderColor: 'rgba(99, 102, 241, 0.3)',
                height: '32px',
                alignSelf: 'center',
              }} 
            />

            {/* Auth Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<User size={18} />}
                onClick={() => setLoginOpen(true)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                  borderRadius: '10px',
                  px: 2.5,
                  py: 0.75,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {t.login}
              </Button>

              <Button
                variant="contained"
                startIcon={<UserPlus size={18} />}
                onClick={() => setRegisterOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                  borderRadius: '10px',
                  px: 2.5,
                  py: 0.75,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                    boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {t.register}
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Login Form */}
      <LoginForm
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />

      {/* Register Form */}
      <SignUpForm
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
};