import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  Fade,
} from '@mui/material';
import { Users, User, Hash, Rocket, Tv } from 'lucide-react';
import { useGame } from '../../context/gamecontext';
import { useNavigate } from 'react-router';

interface JoinRoomFormProps {
  open: boolean;
  onClose: () => void;
  prefilledCode?: string | null;
}

export const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ open, onClose, prefilledCode }) => {
  const { state, joinRoom } = useGame();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isTV, setIsTV] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Auto-rellenar código cuando se proporciona
  useEffect(() => {
    if (prefilledCode) {
      setRoomCode(prefilledCode);
      console.log('🎯 Código auto-rellenado:', prefilledCode);
    }
  }, [prefilledCode]);

  // Navegar automáticamente cuando se una a una sala exitosamente
  useEffect(() => {
    if (state.currentRoom && isJoining) {
      console.log('🎯 Navegando a sala desde join:', state.currentRoom.code);
      console.log('🎯 Estado actual:', { 
        room: state.currentRoom?.code, 
        player: state.currentPlayer?.name,
        isJoining,
        isTV 
      });
      setIsJoining(false);
      onClose();
      
      // Redirigir a la vista TV si el switch está activo
      if (isTV) {
        navigate(`/tv/${state.currentRoom.code}`);
      } else {
        navigate(`/waitingroom/${state.currentRoom.code}`);
      }
    }
  }, [state.currentRoom, isJoining, navigate, onClose, isTV]);

  // Resetear estado de unión si hay error
  useEffect(() => {
    if (state.error && isJoining) {
      console.error('❌ Error uniéndose a sala:', state.error);
      setIsJoining(false);
    }
  }, [state.error, isJoining]);

  const texts = {
    es: {
      title: 'Unirse a una Sala',
      subtitle: 'Ingresa a una partida existente',
      playerName: 'Nombre de Jugador',
      roomCode: 'Código de Sala',
      tvMode: 'Modo TV',
      join: 'Unirse',
      cancel: 'Cancelar',
      namePlaceholder: 'Ingresa tu nombre...',
      codePlaceholder: 'Ej: ABC123',
      tvDesc: 'Mostrar códigos QR y pantalla compartida',
    },
    en: {
      title: 'Join a Room',
      subtitle: 'Enter an existing game',
      playerName: 'Player Name',
      roomCode: 'Room Code',
      tvMode: 'TV Mode',
      join: 'Join',
      cancel: 'Cancel',
      namePlaceholder: 'Enter your name...',
      codePlaceholder: 'Ex: ABC123',
      tvDesc: 'Show QR codes and shared screen',
    },
  };

  const t = texts[state.language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      setIsJoining(true);
      try {
        await joinRoom(roomCode.trim().toUpperCase(), playerName.trim(), false, isTV);
        // La navegación se manejará en el useEffect cuando se una exitosamente
      } catch (error) {
        console.error('Error uniéndose a sala:', error);
        setIsJoining(false);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
              borderRadius: '12px',
              p: 1.5,
              boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.3)',
            }}
          >
            <Users size={24} style={{ color: 'white' }} />
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
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Fade in timeout={500}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    borderRadius: '50%',
                    p: 2,
                    mb: 2,
                    boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.3)',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  <Rocket size={32} style={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#06b6d4', mb: 1 }}>
                  ¡Únete a la diversión!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ingresa tus datos para unirte a una sala existente
                </Typography>
              </Box>

              <TextField
                label={t.playerName}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t.namePlaceholder}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color="#6366f1" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    py: 0.5,
                  },
                }}
              />

              <TextField
                label={t.roomCode}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder={t.codePlaceholder}
                fullWidth
                required
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Hash size={20} color="#06b6d4" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    py: 0.5,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                  },
                }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isTV}
                        onChange={(e) => setIsTV(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#8b5cf6',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tv size={20} color="#8b5cf6" />
                            <Typography sx={{ fontWeight: 600, color: '#8b5cf6' }}>
                              {t.tvMode}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {t.tvDesc}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Box>
              </Box>

              {state.error && (
                <Typography 
                  color="error" 
                  variant="body2"
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {state.error}
                </Typography>
              )}
            </Box>
          </Fade>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={onClose} 
            disabled={state.isLoading}
            variant="outlined"
            color="secondary"
            sx={{ px: 3 }}
          >
            {t.cancel}
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={state.isLoading || !playerName.trim() || !roomCode.trim()}
            startIcon={state.isLoading ? <CircularProgress size={20} /> : <Users size={20} />}
            sx={{ px: 4, flex: 1 }}
          >
            {t.join}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};