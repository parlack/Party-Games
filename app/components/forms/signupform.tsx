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
  FormControlLabel,
  Checkbox,
  Divider,
  Link,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { UserPlus, Lock, Eye, EyeOff, Mail, User, Rocket, Shield } from 'lucide-react';
import { useGame } from '../../context/gamecontext';

interface SignUpFormProps {
  open: boolean;
  onClose: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ open, onClose }) => {
  const { state } = useGame();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const texts = {
    es: {
      title: 'Crear Cuenta',
      subtitle: 'Únete a la comunidad de Space Party',
      username: 'Nombre de Usuario',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      register: 'Crear Cuenta',
      cancel: 'Cancelar',
      acceptTerms: 'Acepto los términos y condiciones',
      hasAccount: '¿Ya tienes cuenta?',
      login: 'Inicia sesión aquí',
      usernamePlaceholder: 'Tu nombre de usuario',
      emailPlaceholder: 'tu@email.com',
      passwordPlaceholder: 'Mínimo 8 caracteres',
      confirmPasswordPlaceholder: 'Repite tu contraseña',
      or: 'O',
      guestMode: 'Continuar como invitado',
      passwordStrength: 'Seguridad de contraseña:',
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
      benefits: {
        title: 'Al crear una cuenta obtienes:',
        history: '• Historial completo de partidas',
        achievements: '• Sistema de logros',
        customization: '• Avatar y perfil personalizable',
        friends: '• Sistema de amigos',
        tournaments: '• Acceso a torneos',
      },
    },
    en: {
      title: 'Create Account',
      subtitle: 'Join the Space Party community',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      register: 'Create Account',
      cancel: 'Cancel',
      acceptTerms: 'I accept the terms and conditions',
      hasAccount: 'Already have an account?',
      login: 'Login here',
      usernamePlaceholder: 'Your username',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Minimum 8 characters',
      confirmPasswordPlaceholder: 'Repeat your password',
      or: 'OR',
      guestMode: 'Continue as guest',
      passwordStrength: 'Password strength:',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      benefits: {
        title: 'By creating an account you get:',
        history: '• Complete game history',
        achievements: '• Achievement system',
        customization: '• Customizable avatar and profile',
        friends: '• Friends system',
        tournaments: '• Access to tournaments',
      },
    },
  };

  const t = texts[state.language];

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, label: t.weak, color: '#ef4444' };
    if (password.length < 10) return { strength: 50, label: t.medium, color: '#f59e0b' };
    return { strength: 100, label: t.strong, color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (!acceptTerms) {
        setError('Debes aceptar los términos y condiciones');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onClose();
      // Here you would typically create the user account
    } catch (err) {
      setError('Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    onClose();
  };

  const isFormValid = formData.username.trim() && 
                     formData.email.trim() && 
                     formData.password.length >= 6 && 
                     formData.password === formData.confirmPassword &&
                     acceptTerms;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
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
          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Left Column - Form */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label={t.username}
                value={formData.username}
                onChange={handleInputChange('username')}
                placeholder={t.usernamePlaceholder}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color="#6366f1" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={t.email}
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
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

              <Box>
                <TextField
                  label={t.password}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
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
                {formData.password && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t.passwordStrength}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ color: passwordStrength.color, fontWeight: 600 }}
                      >
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength.strength}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: passwordStrength.color,
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <TextField
                label={t.confirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder={t.confirmPasswordPlaceholder}
                fullWidth
                required
                error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Shield size={20} color="#6366f1" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#6366f1' }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    sx={{ color: '#6366f1' }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t.acceptTerms.split('términos y condiciones')[0]}
                    <Link href="#" sx={{ color: '#06b6d4', textDecoration: 'none' }}>
                      términos y condiciones
                    </Link>
                  </Typography>
                }
              />

              {error && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                  {error}
                </Alert>
              )}
            </Box>

            {/* Right Column - Benefits */}
            <Box sx={{ 
              flex: 1, 
              p: 3, 
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              height: 'fit-content',
            }}>
              <Typography variant="h6" sx={{ color: '#06b6d4', mb: 2, fontWeight: 600 }}>
                {t.benefits.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {t.benefits.history}<br />
                {t.benefits.achievements}<br />
                {t.benefits.customization}<br />
                {t.benefits.friends}<br />
                {t.benefits.tournaments}
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
            disabled={isLoading || !isFormValid}
            startIcon={isLoading ? <CircularProgress size={20} /> : <UserPlus size={20} />}
            sx={{
              background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {t.register}
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
              {t.hasAccount}{' '}
              <Link
                href="#"
                sx={{ 
                  color: '#06b6d4',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {t.login}
              </Link>
            </Typography>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};