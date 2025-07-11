import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { Settings, Users as UsersIcon, Crown, Share2, X, Gamepad2, Info, Rocket } from 'lucide-react';
import { useGame } from '../context/gamecontext';
import { Layout } from '../components/layouts/layout';
import { useNavigate, useParams } from 'react-router';
import { apiService } from '../services/apiService';

export const loader = async () => {
  return null;
};

const WaitingRoom: React.FC = () => {
  const { state, getRoomByCode, leaveRoom } = useGame();
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState(state.currentRoom);

  // Actualizar la sala local cuando cambie la sala del contexto
  useEffect(() => {
    if (state.currentRoom) {
      setRoom(state.currentRoom);
    }
  }, [state.currentRoom]);

  // Si no hay sala en el contexto pero hay roomCode en la URL, verificar si existe
  useEffect(() => {
    const checkRoomExists = async () => {
      if (!state.currentRoom && roomCode && !state.isLoading) {
        console.log('🔍 Verificando si existe sala:', roomCode);
        try {
          const response = await apiService.getRoomByCode(roomCode);
          if (!response.success) {
            console.log('❌ Sala no encontrada, redirigiendo al inicio');
            navigate('/');
          } else {
            console.log('✅ Sala encontrada pero no estás unido. Redirigiendo al inicio para que te unas.');
            navigate('/');
          }
        } catch (error) {
          console.error('Error verificando sala:', error);
          navigate('/');
        }
      }
    };

    // Dar un poco de tiempo para que el contexto se inicialice
    const timeout = setTimeout(checkRoomExists, 1000);
    return () => clearTimeout(timeout);
     }, [state.currentRoom, roomCode, navigate, state.isLoading]);

  const texts = {
    es: {
      title: 'Sala de Espera',
      subtitle: 'Esperando a que se unan más jugadores...',
      roomCode: 'Código de Sala',
      players: 'Jugadores',
      copyCode: 'Copiar Código',
      shareLink: 'Compartir Enlace',
      startGame: 'Iniciar Juego',
      waitingForPlayers: 'Esperando jugadores...',
      readyToStart: 'Listo para comenzar',
      backToHome: 'Volver al Inicio',
    },
    en: {
      title: 'Waiting Room',
      subtitle: 'Waiting for more players to join...',
      roomCode: 'Room Code',
      players: 'Players',
      copyCode: 'Copy Code',
      shareLink: 'Share Link',
      startGame: 'Start Game',
      waitingForPlayers: 'Waiting for players...',
      readyToStart: 'Ready to start',
      backToHome: 'Back to Home',
    },
  };

  const t = texts[state.language];

  const handleCopyCode = () => {
    const currentRoom = room || state.currentRoom;
    if (currentRoom?.code) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    const currentRoom = room || state.currentRoom;
    if (!currentRoom?.code) return;

    const shareUrl = `${window.location.origin}/?join=${currentRoom.code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Space Party - ¡Únete a mi sala!',
          text: `¡Únete a mi sala de Space Party! Código: ${currentRoom.code}`,
          url: shareUrl,
        });
      } catch (error) {
        // Si el usuario cancela el share, fallback a copiar al clipboard
        handleCopyShareLink(shareUrl);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      handleCopyShareLink(shareUrl);
    }
  };

  const handleCopyShareLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  // Usar la sala encontrada o la sala actual
  const currentRoom = room || state.currentRoom;

  // Si no hay sala, mostrar loading o redirigir
  if (!currentRoom) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Cargando sala...
          </Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Encabezado superior */}
        <Box sx={{ width: '100%', maxWidth: 1100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 60%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px 0 rgba(99,102,241,0.15)'
            }}>
              <Rocket size={40} color="#fff" />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  lineHeight: 1,
                  fontFamily: 'inherit', // Usar la fuente global
                  letterSpacing: 0.5,
                  mb: 0.5,
                }}
              >
                Sala de Espera
              </Typography>
              <Typography variant="h6" sx={{ color: '#b3b3ff', fontWeight: 500, fontFamily: 'inherit', letterSpacing: 0.2 }}>
                {currentRoom.name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleShareLink}
              sx={{ borderColor: '#38bdf8', color: '#38bdf8', fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, fontSize: 16 }} 
              startIcon={<Share2 size={20} />}
            >
              {copied ? 'Enlace Copiado!' : 'Compartir Sala'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleLeaveRoom}
              sx={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, fontSize: 16 }} 
              startIcon={<X size={20} />}
            >
              Salir de la Sala
            </Button>
          </Box>
        </Box>
        {/* Fin encabezado superior */}
        <Box sx={{ width: '100%', maxWidth: 1100, display: 'flex', gap: 4 }}>
          {/* Información de la Sala */}
          <Box sx={{ flex: 1, minWidth: 340 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #23244a 60%, #2d2250 100%)',
              borderRadius: '24px',
              p: 4,
              boxShadow: '0 8px 32px 0 rgba(99,102,241,0.10)',
              mb: 2,
              border: '1.5px solid #353570',
              transition: 'box-shadow 0.2s',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38bdf8 60%, #06b6d4 100%)', // azul/celeste
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)'
                }}>
                  <Settings size={24} color="#fff" />
                </Box>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: 'inherit' }}>
                  Información de la Sala
                </Typography>
                <Box sx={{ ml: 1, px: 1.5, py: 0.5, borderRadius: 2, background: 'linear-gradient(90deg, #6366f1 60%, #8b5cf6 100%)', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px 0 rgba(99,102,241,0.10)' }}>
                  Host
                </Box>
              </Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1, fontSize: 22, letterSpacing: 0.5 }}>
                {currentRoom.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography sx={{ color: '#b3b3ff', fontWeight: 500, fontSize: 15 }}>Código de Sala:</Typography>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, background: '#23244a', color: '#fff', fontWeight: 700, fontFamily: 'monospace', fontSize: 18, letterSpacing: 2, border: '1px solid #353570' }}>
                  {currentRoom.code}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, background: 'rgba(99,102,241,0.10)', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #353570' }}>
                  <UsersIcon size={20} color="#8b5cf6" />
                  <Typography sx={{ color: '#b3b3ff', fontSize: 13, mt: 1 }}>Máx. Jugadores</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{currentRoom.maxPlayers}</Typography>
                </Box>
                <Box sx={{ flex: 1, background: 'rgba(139,92,246,0.10)', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #353570' }}>
                  <Gamepad2 size={20} color="#6366f1" />
                  <Typography sx={{ color: '#b3b3ff', fontSize: 13, mt: 1 }}>Minijuegos</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{currentRoom.minigameCount}</Typography>
                </Box>
              </Box>
              <Box sx={{ background: 'rgba(16,185,129,0.08)', borderRadius: 2, p: 2, mb: 2, border: '1px solid #1e3a34' }}>
                <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
                  Tipo de Juego
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 17, textAlign: 'center' }}>
                  {currentRoom.isRandomGames ? 'Aleatorio' : 'Personalizado'}
                </Typography>
              </Box>
              <Box sx={{ background: 'rgba(59,130,246,0.08)', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #1e3a8a' }}>
                <Info size={18} color="#38bdf8" />
                <Typography sx={{ color: '#38bdf8', fontSize: 14 }}>
                  Se necesitan al menos 2 jugadores para iniciar
                </Typography>
              </Box>
              {/* Botón de iniciar juego solo aquí, sin botones extra */}
              <Button
                variant="contained"
                fullWidth
                disabled
                sx={{ mt: 2, background: '#23244a', color: '#b3b3ff', fontWeight: 700, fontSize: 18, borderRadius: 2, boxShadow: 'none', '&:hover': { background: '#23244a' } }}
              >
                Iniciar Juego
              </Button>
            </Box>
          </Box>
          {/* Jugadores */}
          <Box sx={{ flex: 1, minWidth: 340 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #2d2250 60%, #23244a 100%)',
              borderRadius: '24px',
              p: 4,
              boxShadow: '0 8px 32px 0 rgba(139,92,246,0.10)',
              border: '1.5px solid #353570',
              transition: 'box-shadow 0.2s',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a78bfa 60%, #6366f1 100%)', // morado/lila
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px 0 rgba(139,92,246,0.10)'
                }}>
                  <UsersIcon size={24} color="#fff" />
                </Box>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: 'inherit' }}>
                  Jugadores
                </Typography>
                <Box sx={{ ml: 1, px: 1.5, py: 0.5, borderRadius: 2, background: 'linear-gradient(90deg, #10b981 60%, #38bdf8 100%)', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px 0 rgba(16,185,129,0.10)' }}>
                  {currentRoom.players.length} Activos
                </Box>
                <Typography sx={{ color: '#b3b3ff', fontSize: 13, ml: 1 }}>
                  ({currentRoom.players.length}/{currentRoom.maxPlayers})
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                {currentRoom.players.map((player) => (
                  <Box key={player.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 2, mb: 2, background: 'rgba(99,102,241,0.06)', borderRadius: 2, p: 2, border: '1px solid #353570'
                  }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: player.isHost ? '#6366f1' : '#06b6d4', fontWeight: 700, fontSize: 20 }}>
                      {player.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{player.name} {player.isHost && <Crown size={16} style={{ verticalAlign: 'middle', marginLeft: 4 }} />} <Box component="span" sx={{ ml: 1, px: 1, py: 0.2, borderRadius: 1, background: player.isHost ? '#fbbf24' : '#6366f1', color: '#23244a', fontSize: 12, fontWeight: 700, display: player.isHost ? 'inline-block' : 'none' }}>Anfitrión</Box></Typography>
                      <Typography sx={{ color: '#b3b3ff', fontSize: 13 }}>Se unió: {player.joinedAt.toLocaleTimeString()}</Typography>
                    </Box>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', ml: 1 }} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default WaitingRoom;