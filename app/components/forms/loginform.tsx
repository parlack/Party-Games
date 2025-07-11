import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { User, Lock, Eye, EyeOff, Mail, Rocket } from 'lucide-react';
import { useGame } from '../../context/gamecontext';

interface LoginFormProps {
  open: boolean;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ open, onClose }) => {
  const { state } = useGame();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const texts = {
    es: {
      title: 'Iniciar Sesión',
      subtitle: 'Accede a tu cuenta de Space Party',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      login: 'Iniciar Sesión',
      cancel: 'Cancelar',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      register: 'Regístrate aquí',
      emailPlaceholder: 'tu@email.com',
      passwordPlaceholder: 'Tu contraseña',
      or: 'O',
      guestMode: 'Continuar como invitado',
      benefits: {
        title: 'Beneficios de tener cuenta:',
        history: '• Historial de partidas',
        stats: '• Estadísticas personales',
        friends: '• Lista de amigos',
        customization: '• Personalización de perfil',
      },
    },
    en: {
      title: 'Login',
      subtitle: 'Access your Space Party account',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      cancel: 'Cancel',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      register: 'Register here',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Your password',
      or: 'OR',
      guestMode: 'Continue as guest',
      benefits: {
        title: 'Account benefits:',
        history: '• Game history',
        stats: '• Personal statistics',
        friends: '• Friends list',
        customization: '• Profile customization',
      },
    },
  };

  const t = texts[state.language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock login logic
      if (email === 'test@test.com' && password === 'password') {
        onClose();
        // Here you would typically set the user in context
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    onClose();
    // Continue as guest - no authentication needed
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a1b3a 0%, #2d1b69 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
              borderRadius: '12px',
              p: 1,
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
            }}
          >
            <Rocket size={24} style={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              {t.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.subtitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label={t.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} color="#6366f1" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t.password}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} color="#6366f1" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#6366f1' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: 'right' }}>
              <Link
                href="#"
                variant="body2"
                sx={{ 
                  color: '#06b6d4',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {t.forgotPassword}
              </Link>
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            <Box sx={{ 
              p: 3, 
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <Typography variant="subtitle2" sx={{ color: '#06b6d4', mb: 1, fontWeight: 600 }}>
                {t.benefits.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                {t.benefits.history}<br />
                {t.benefits.stats}<br />
                {t.benefits.friends}<br />
                {t.benefits.customization}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3, pt: 0 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading || !email.trim() || !password.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : <User size={20} />}
            sx={{
              background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {t.login}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
            <Divider sx={{ flex: 1, borderColor: 'rgba(99, 102, 241, 0.3)' }} />
            <Typography variant="body2" color="text.secondary">
              {t.or}
            </Typography>
            <Divider sx={{ flex: 1, borderColor: 'rgba(99, 102, 241, 0.3)' }} />
          </Box>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={handleGuestMode}
            sx={{
              borderColor: 'rgba(6, 182, 212, 0.5)',
              color: '#06b6d4',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
              },
            }}
          >
            {t.guestMode}
          </Button>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
            <Button onClick={onClose} disabled={isLoading} sx={{ color: 'text.secondary' }}>
              {t.cancel}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {t.noAccount}{' '}
              <Link
                href="#"
                sx={{ 
                  color: '#06b6d4',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {t.register}
              </Link>
            </Typography>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};