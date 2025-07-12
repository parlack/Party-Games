import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Box, Typography, Grid, Card, CardContent, Avatar, Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { Tv, Users, Settings, Wifi, QrCode, Music, Share2, Crown } from 'lucide-react';
import { Layout } from '../components/layouts/layout';
import { useGame } from '../context/gamecontext';
import { apiService } from '../services/apiService';
import { QRCodeComponent } from '../components/ui/qrcode';

const TVView: React.FC = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [room, setRoom] = useState(state.currentRoom);
  const [spotifyJamUrl, setSpotifyJamUrl] = useState('');
  const [showSpotifyQR, setShowSpotifyQR] = useState(false);

  // Actualizar la sala local cuando cambie la sala del contexto
  useEffect(() => {
    if (state.currentRoom) {
      setRoom(state.currentRoom);
    }
  }, [state.currentRoom]);

  // Verificar si la sala existe y si el usuario actual es TV
  useEffect(() => {
    const checkTVAccess = async () => {
      if (!state.currentRoom && roomCode && !state.isLoading) {
        try {
          const response = await apiService.getRoomByCode(roomCode);
          if (!response.success) {
            navigate('/');
          }
        } catch (error) {
          console.error('Error verificando sala:', error);
          navigate('/');
        }
      }
      
      // Verificar si el usuario actual es TV
      if (state.currentPlayer && !state.currentPlayer.isTV) {
        navigate(`/waitingroom/${roomCode}`);
      }
    };

    const timeout = setTimeout(checkTVAccess, 1000);
    return () => clearTimeout(timeout);
  }, [state.currentRoom, roomCode, navigate, state.isLoading, state.currentPlayer]);

  const currentRoom = room || state.currentRoom;

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

  const shareUrl = `${window.location.origin}/?join=${currentRoom.code}`;

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 60%, #a78bfa 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px 0 rgba(139,92,246,0.3)'
            }}>
              <Tv size={48} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, mb: 0.5 }}>
                Vista TV
              </Typography>
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                {currentRoom.name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ px: 3, py: 1, borderRadius: 2, background: '#10b981', color: '#fff', fontWeight: 700 }}>
              <Wifi size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Conectado
            </Box>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ flex: 1 }}>
          {/* Código QR para unirse */}
          <Grid size={{ xs: 12, md: showSpotifyQR && spotifyJamUrl ? 4 : 6 }}>
            <Card sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #23244a 60%, #2d2250 100%)',
              border: '1.5px solid #353570'
            }}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <QrCode size={32} color="#06b6d4" />
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    ¡Únete a la Sala!
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <QRCodeComponent
                    value={shareUrl}
                    size={300}
                    subtitle="Escanea para unirte a la sala"
                  />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#06b6d4', fontWeight: 700, mb: 1 }}>
                    Código de Sala
                  </Typography>
                  <Box sx={{ 
                    px: 4, py: 2, 
                    borderRadius: 2, 
                    background: '#23244a', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontFamily: 'monospace', 
                    fontSize: 32, 
                    letterSpacing: 4,
                    border: '2px solid #06b6d4'
                  }}>
                    {currentRoom.code}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* QR de Spotify (si está habilitado) */}
          {showSpotifyQR && spotifyJamUrl && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #1db954 60%, #1ed760 100%)',
                border: '1.5px solid #1db954'
              }}>
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Music size={32} color="#fff" />
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      Spotify Jam
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <QRCodeComponent
                      value={spotifyJamUrl}
                      size={250}
                      subtitle="Escanea para unirte al Jam"
                    />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                      🎵 Música Compartida
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Únete al Jam de Spotify para escuchar música juntos
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Información de la sala y jugadores */}
          <Grid size={{ xs: 12, md: showSpotifyQR && spotifyJamUrl ? 4 : 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
              {/* Información de la sala */}
              <Card sx={{ 
                background: 'linear-gradient(135deg, #2d2250 60%, #23244a 100%)',
                border: '1.5px solid #353570'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Settings size={24} color="#38bdf8" />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                      Información de la Sala
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(99,102,241,0.1)', borderRadius: 2 }}>
                        <Typography sx={{ color: '#b3b3ff', fontSize: 14 }}>Jugadores</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>
                          {currentRoom.players.filter(p => (p.isOnline || p.isOnline === undefined) && !p.isTV).length}/{currentRoom.maxPlayers}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(139,92,246,0.1)', borderRadius: 2 }}>
                        <Typography sx={{ color: '#b3b3ff', fontSize: 14 }}>Minijuegos</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>
                          {currentRoom.minigameCount}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Lista de jugadores */}
              <Card sx={{ 
                flex: 1,
                background: 'linear-gradient(135deg, #23244a 60%, #2d2250 100%)',
                border: '1.5px solid #353570'
              }}>
                <CardContent sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Users size={24} color="#10b981" />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                      Jugadores Conectados
                    </Typography>
                  </Box>
                  
                  <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {currentRoom.players.filter(p => (p.isOnline || p.isOnline === undefined) && !p.isTV).map((player) => (
                      <Box key={player.id} sx={{
                        display: 'flex', alignItems: 'center', gap: 2, mb: 2, 
                        background: 'rgba(99,102,241,0.06)', borderRadius: 2, p: 2
                      }}>
                        <Avatar sx={{ 
                          width: 40, height: 40, 
                          bgcolor: player.isHost ? '#6366f1' : '#06b6d4', 
                          fontWeight: 700, fontSize: 18 
                        }}>
                          {player.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                            {player.name}
                            {player.isHost && <Crown size={16} style={{ verticalAlign: 'middle', marginLeft: 4 }} />}
                          </Typography>
                          <Typography sx={{ color: '#b3b3ff', fontSize: 12 }}>
                            {player.isHost ? 'Anfitrión' : 'Jugador'}
                          </Typography>
                        </Box>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Configuración de Spotify */}
              <Card sx={{ 
                background: 'linear-gradient(135deg, #1db954 60%, #1ed760 100%)',
                border: '1.5px solid #1db954'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Music size={24} color="#fff" />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                      Spotify Jam
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Pega aquí el enlace de Spotify Jam"
                      value={spotifyJamUrl}
                      onChange={(e) => setSpotifyJamUrl(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255,255,255,0.1)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#fff' },
                        },
                        '& .MuiInputBase-input': { color: '#fff' },
                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' },
                      }}
                    />
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showSpotifyQR}
                        onChange={(e) => setShowSpotifyQR(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#fff' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#fff' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                        Mostrar QR de Spotify
                      </Typography>
                    }
                  />
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default TVView; 