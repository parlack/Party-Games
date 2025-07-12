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
  Stepper,
  Step,
  StepLabel,
  Slider,
  CircularProgress,
  Fade,
  Zoom,
} from '@mui/material';
import { Plus, Settings, Users, Gamepad2, Sparkles, Rocket, Tv } from 'lucide-react';
import { useGame } from '../../context/gamecontext';
import { useNavigate } from 'react-router';

interface CreateRoomWizardProps {
  open: boolean;
  onClose: () => void;
}

export const CreateRoomWizard: React.FC<CreateRoomWizardProps> = ({ open, onClose }) => {
  const { state, createRoom } = useGame();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [minigameCount, setMinigameCount] = useState(5);
  const [isRandomGames, setIsRandomGames] = useState(true);
  const [hostName, setHostName] = useState('');
  const [isTV, setIsTV] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Navegar automáticamente cuando se una a una sala exitosamente
  useEffect(() => {
    if (state.currentRoom && state.currentPlayer && isCreating) {
      console.log('🎯 Navegando a sala desde create:', state.currentRoom.code);
      console.log('🎯 Estado actual:', { 
        room: state.currentRoom?.code, 
        player: state.currentPlayer?.name,
        playerIsTV: state.currentPlayer?.isTV,
        isCreating,
        localIsTV: isTV 
      });
      setIsCreating(false);
      onClose();
      setActiveStep(0);
      
      // Redirigir a la vista TV si el jugador se creó como TV
      if (state.currentPlayer.isTV) {
        console.log('🎯 Navegando a modo TV');
        navigate(`/tv/${state.currentRoom.code}`);
      } else {
        console.log('🎯 Navegando a sala de espera');
        navigate(`/waitingroom/${state.currentRoom.code}`);
      }
    }
  }, [state.currentRoom, state.currentPlayer, isCreating, navigate, onClose, isTV]);

  // Resetear estado de creación si hay error
  useEffect(() => {
    if (state.error && isCreating) {
      console.error('❌ Error creando sala:', state.error);
      setIsCreating(false);
    }
  }, [state.error, isCreating]);

  const texts = {
    es: {
      title: 'Crear Nueva Sala',
      steps: ['Información', 'Configuración', 'Confirmación'],
      roomName: 'Nombre de la Sala',
      maxPlayers: 'Máximo de Jugadores',
      minigameCount: 'Cantidad de Minijuegos',
      randomGames: 'Juegos Aleatorios',
      customGames: 'Juegos Personalizados',
      back: 'Atrás',
      next: 'Siguiente',
      create: 'Crear Sala',
      cancel: 'Cancelar',
      namePlaceholder: 'Ej: Sala de Amigos',
      playersLabel: 'jugadores',
      gamesLabel: 'juegos',
      summary: 'Resumen de la Sala',
      confirmText: 'Confirma los detalles y crea tu sala de juego.',
      hostName: 'Tu nombre',
      hostNamePlaceholder: 'Ej: Juan',
      tvMode: 'Modo TV',
      tvDesc: 'Mostrar códigos QR y pantalla compartida',
    },
    en: {
      title: 'Create New Room',
      steps: ['Information', 'Settings', 'Confirmation'],
      roomName: 'Room Name',
      maxPlayers: 'Max Players',
      minigameCount: 'Number of Minigames',
      randomGames: 'Random Games',
      customGames: 'Custom Games',
      back: 'Back',
      next: 'Next',
      create: 'Create Room',
      cancel: 'Cancel',
      namePlaceholder: 'Ex: Friends Room',
      playersLabel: 'players',
      gamesLabel: 'games',
      summary: 'Room Summary',
      confirmText: 'Confirm the details and create your game room.',
      hostName: 'Your name',
      hostNamePlaceholder: 'Ex: John',
      tvMode: 'TV Mode',
      tvDesc: 'Show QR codes and shared screen',
    },
  };

  const t = texts[state.language];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    const settings = {
      name: roomName,
      maxPlayers,
      minigameCount,
      isRandomGames,
      hostName: hostName.trim() || 'Host',
      isTV,
    };
    
    try {
      await createRoom(settings);
      // La navegación se manejará en el useEffect cuando se una exitosamente
    } catch (error) {
      console.error('Error creando sala:', error);
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setActiveStep(0);
    setRoomName('');
    setMaxPlayers(6);
    setMinigameCount(5);
    setIsRandomGames(true);
    setHostName('');
    setIsTV(false);
    setIsCreating(false);
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 0: return <Settings size={20} />;
      case 1: return <Users size={20} />;
      case 2: return <Gamepad2 size={20} />;
      default: return null;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
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
                  ¡Vamos a crear tu sala!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comienza dándole un nombre único a tu sala de juegos
                </Typography>
              </Box>
              
              <TextField
                label={t.roomName}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={t.namePlaceholder}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    py: 1,
                  },
                }}
              />
              <TextField
                label={t.hostName || 'Tu nombre'}
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder={t.hostNamePlaceholder || 'Ej: Juan'}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    py: 1,
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
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in timeout={500}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
                    borderRadius: '50%',
                    p: 2,
                    mb: 2,
                    boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.3)',
                  }}
                >
                  <Settings size={32} style={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#06b6d4', mb: 1 }}>
                  Configuración del juego
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personaliza la experiencia de juego para tu grupo
                </Typography>
              </Box>

              <Box sx={{ 
                p: 3, 
                backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                borderRadius: '16px',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <Typography gutterBottom sx={{ fontWeight: 600, color: '#8b5cf6', mb: 2 }}>
                  {t.maxPlayers}
                </Typography>
                <Slider
                  value={maxPlayers}
                  onChange={(e, value) => setMaxPlayers(value as number)}
                  min={2}
                  max={20}
                  marks={[
                    { value: 2, label: '2' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} ${t.playersLabel}`}
                  sx={{
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                      boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ 
                p: 3, 
                backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                borderRadius: '16px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>
                <Typography gutterBottom sx={{ fontWeight: 600, color: '#06b6d4', mb: 2 }}>
                  {t.minigameCount}
                </Typography>
                <Slider
                  value={minigameCount}
                  onChange={(e, value) => setMinigameCount(value as number)}
                  min={1}
                  max={10}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} ${t.gamesLabel}`}
                  sx={{
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
                      boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.4)',
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ 
                p: 3, 
                backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#8b5cf6', mb: 0.5 }}>
                    {isRandomGames ? t.randomGames : t.customGames}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isRandomGames ? 'Los juegos se seleccionarán automáticamente' : 'Podrás elegir los juegos específicos'}
                  </Typography>
                </Box>
                <Switch
                  checked={isRandomGames}
                  onChange={(e) => setIsRandomGames(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-thumb': {
                      background: 'linear-gradient(45deg, #8b5cf6 30%, #a78bfa 90%)',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(139, 92, 246, 0.3)',
                    },
                  }}
                />
              </Box>
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in timeout={500}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                    borderRadius: '50%',
                    p: 2,
                    mb: 2,
                    boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Sparkles size={32} style={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#10b981', mb: 1 }}>
                  {t.summary}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.confirmText}
                </Typography>
              </Box>

              <Box sx={{ 
                p: 4, 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600, color: '#10b981' }}>{t.roomName}:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{roomName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600, color: '#10b981' }}>{t.maxPlayers}:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{maxPlayers}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600, color: '#10b981' }}>{t.minigameCount}:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>{minigameCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600, color: '#10b981' }}>Tipo:</Typography>
                  <Typography sx={{ color: 'white', fontWeight: 500 }}>
                    {isRandomGames ? t.randomGames : t.customGames}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          minHeight: '600px',
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
              background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
              borderRadius: '12px',
              p: 1.5,
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
            }}
          >
            <Plus size={24} style={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              {t.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paso {activeStep + 1} de {t.steps.length}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root': {
              '& .MuiStepIcon-root': {
                color: 'rgba(99, 102, 241, 0.3)',
                '&.Mui-active': {
                  color: '#6366f1',
                },
                '&.Mui-completed': {
                  color: '#10b981',
                },
              },
            },
          }}
        >
          {t.steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: index <= activeStep 
                        ? 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)'
                        : 'rgba(99, 102, 241, 0.2)',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      ...(index === activeStep && {
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        transform: 'scale(1.1)',
                      }),
                    }}
                  >
                    {getStepIcon(index)}
                  </Box>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '400px' }}>
          {getStepContent(activeStep)}
        </Box>

        {state.error && (
          <Zoom in>
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {state.error}
            </Typography>
          </Zoom>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={state.isLoading}
          variant="outlined"
          color="secondary"
          sx={{ px: 3 }}
        >
          {t.cancel}
        </Button>
        
        <Box sx={{ flex: '1 1 auto' }} />
        
        {activeStep > 0 && (
          <Button 
            onClick={handleBack} 
            disabled={state.isLoading}
            variant="outlined"
            sx={{ px: 3 }}
          >
            {t.back}
          </Button>
        )}
        
        {activeStep < t.steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && !roomName.trim()}
            sx={{ px: 4 }}
          >
            {t.next}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={state.isLoading}
            startIcon={state.isLoading ? <CircularProgress size={20} /> : <Sparkles size={20} />}
            sx={{ px: 4 }}
          >
            {t.create}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};