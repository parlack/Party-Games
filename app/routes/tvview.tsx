import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Container, Box, Typography, Grid, Card, CardContent, Avatar, Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { Tv, Users, Settings, Wifi, QrCode, Music, Share2, Crown, Trophy, Target, Clock, Star, TrendingUp } from 'lucide-react';
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
  const [currentView, setCurrentView] = useState<'qr' | 'rankings' | 'stats'>('qr');
  
  // Datos simulados para rankings y estadísticas
  const [gameStats] = useState({
    totalGames: 0,
    currentRound: 0,
    averageScore: 0,
    topScorer: null as string | null,
    gameHistory: [] as any[]
  });

  // Actualizar la sala local cuando cambie la sala del contexto
  useEffect(() => {
    if (state.currentRoom) {
      setRoom(state.currentRoom);
    }
  }, [state.currentRoom]);

  // Actualizar rankings cada 5 segundos cuando está en vista de rankings
  useEffect(() => {
    if (currentView === 'rankings') {
      const interval = setInterval(() => {
        // Forzar re-render para actualizar los rankings simulados
        setRoom(prevRoom => {
          if (prevRoom) {
            return { ...prevRoom, lastActivity: new Date() };
          }
          return prevRoom;
        });
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [currentView]);

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

  // Simular rankings de jugadores
  const playerRankings = currentRoom?.players
    .filter(p => (p.isOnline || p.isOnline === undefined) && !p.isTV)
    .map(player => ({
      ...player,
      score: Math.floor(Math.random() * 1000) + 100,
      wins: Math.floor(Math.random() * 10),
      gamesPlayed: Math.floor(Math.random() * 20) + 5,
      accuracy: Math.floor(Math.random() * 40) + 60
    }))
    .sort((a, b) => b.score - a.score) || [];

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
            {/* Navegación entre vistas */}
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              <Button
                variant={currentView === 'qr' ? 'contained' : 'outlined'}
                onClick={() => setCurrentView('qr')}
                sx={{ 
                  minWidth: 'auto', 
                  px: 2, 
                  py: 1,
                  borderColor: '#06b6d4',
                  color: currentView === 'qr' ? '#fff' : '#06b6d4',
                  backgroundColor: currentView === 'qr' ? '#06b6d4' : 'transparent',
                  '&:hover': { backgroundColor: currentView === 'qr' ? '#0891b2' : 'rgba(6, 182, 212, 0.1)' }
                }}
                startIcon={<QrCode size={16} />}
              >
                QR
              </Button>
              <Button
                variant={currentView === 'rankings' ? 'contained' : 'outlined'}
                onClick={() => setCurrentView('rankings')}
                sx={{ 
                  minWidth: 'auto', 
                  px: 2, 
                  py: 1,
                  borderColor: '#f59e0b',
                  color: currentView === 'rankings' ? '#fff' : '#f59e0b',
                  backgroundColor: currentView === 'rankings' ? '#f59e0b' : 'transparent',
                  '&:hover': { backgroundColor: currentView === 'rankings' ? '#d97706' : 'rgba(245, 158, 11, 0.1)' }
                }}
                startIcon={<Trophy size={16} />}
              >
                Rankings
              </Button>
              <Button
                variant={currentView === 'stats' ? 'contained' : 'outlined'}
                onClick={() => setCurrentView('stats')}
                sx={{ 
                  minWidth: 'auto', 
                  px: 2, 
                  py: 1,
                  borderColor: '#8b5cf6',
                  color: currentView === 'stats' ? '#fff' : '#8b5cf6',
                  backgroundColor: currentView === 'stats' ? '#8b5cf6' : 'transparent',
                  '&:hover': { backgroundColor: currentView === 'stats' ? '#7c3aed' : 'rgba(139, 92, 246, 0.1)' }
                }}
                startIcon={<TrendingUp size={16} />}
              >
                Estadísticas
              </Button>
            </Box>
            
            <Box sx={{ px: 3, py: 1, borderRadius: 2, background: '#10b981', color: '#fff', fontWeight: 700 }}>
              <Wifi size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Conectado
            </Box>
          </Box>
        </Box>

        {/* Contenido condicional según la vista */}
        {currentView === 'qr' && (
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
        )}

        {/* Vista de Rankings */}
        {currentView === 'rankings' && (
          <Grid container spacing={4} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f59e0b 60%, #d97706 100%)',
                border: '1.5px solid #f59e0b',
                mb: 3
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Trophy size={32} color="#fff" />
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      🏆 Ranking de Jugadores
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Clasificación actual de la sala
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Lista de Rankings */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={3}>
                {playerRankings.map((player, index) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={player.id}>
                    <Card sx={{ 
                      background: index === 0 ? 'linear-gradient(135deg, #fbbf24 60%, #f59e0b 100%)' :
                                 index === 1 ? 'linear-gradient(135deg, #9ca3af 60%, #6b7280 100%)' :
                                 index === 2 ? 'linear-gradient(135deg, #cd7c2f 60%, #92400e 100%)' :
                                 'linear-gradient(135deg, #374151 60%, #1f2937 100%)',
                      border: '1.5px solid',
                      borderColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#374151',
                      position: 'relative',
                      overflow: 'visible'
                    }}>
                      {/* Posición */}
                      <Box sx={{
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#fff',
                        border: '3px solid #1f2937'
                      }}>
                        {index + 1}
                      </Box>

                      <CardContent sx={{ p: 3, pt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ 
                            width: 50, height: 50, 
                            bgcolor: player.isHost ? '#6366f1' : '#06b6d4', 
                            fontWeight: 700, fontSize: 20 
                          }}>
                            {player.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
                              {player.name}
                              {player.isHost && <Crown size={16} style={{ verticalAlign: 'middle', marginLeft: 4 }} />}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                              {player.isHost ? 'Anfitrión' : 'Jugador'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Puntuación</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{player.score}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Victorias</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{player.wins}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Partidas</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{player.gamesPlayed}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Precisión</Typography>
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{player.accuracy}%</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Vista de Estadísticas */}
        {currentView === 'stats' && (
          <Grid container spacing={4} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #8b5cf6 60%, #7c3aed 100%)',
                border: '1.5px solid #8b5cf6',
                mb: 3
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TrendingUp size={32} color="#fff" />
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      📊 Estadísticas de la Sala
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Análisis detallado del rendimiento
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Estadísticas Generales */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #06b6d4 60%, #0891b2 100%)',
                border: '1.5px solid #06b6d4',
                height: '100%'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Target size={24} color="#fff" />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                      Estadísticas Generales
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Jugadores Activos</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>
                        {currentRoom.players.filter(p => (p.isOnline || p.isOnline === undefined) && !p.isTV).length}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Tiempo Activo</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>
                        {Math.floor((Date.now() - new Date(currentRoom.createdAt).getTime()) / 60000)}m
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Partidas Jugadas</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{gameStats.totalGames}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Ronda Actual</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{gameStats.currentRound}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top 3 Jugadores */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #10b981 60%, #059669 100%)',
                border: '1.5px solid #10b981',
                height: '100%'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Star size={24} color="#fff" />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                      Top 3 Jugadores
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {playerRankings.slice(0, 3).map((player, index) => (
                      <Box key={player.id} sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        p: 2, 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: 2 
                      }}>
                        <Box sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7c2f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#fff'
                        }}>
                          {index + 1}
                        </Box>
                        <Avatar sx={{ 
                          width: 35, height: 35, 
                          bgcolor: player.isHost ? '#6366f1' : '#06b6d4', 
                          fontWeight: 700, fontSize: 16 
                        }}>
                          {player.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                            {player.name}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                            {player.score} puntos
                          </Typography>
                        </Box>
                        {player.isHost && <Crown size={16} color="#fbbf24" />}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default TVView; 