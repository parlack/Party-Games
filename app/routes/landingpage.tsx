import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';
import { Users, Plus, Zap, Trophy, Rocket } from 'lucide-react';
import { useGame } from '../context/gamecontext';
import { JoinRoomForm } from '../components/forms/joinroomform';
import { CreateRoomWizard } from '../components/forms/createroomwizard';
import { Layout } from '../components/layouts/layout';
import { useSearchParams } from 'react-router';
import '../styles/globals.css';

export const loader = async () => {
  return null;
};

const LandingPage: React.FC = () => {
  const { state } = useGame();
  const [searchParams, setSearchParams] = useSearchParams();
  const [joinFormOpen, setJoinFormOpen] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [autoJoinCode, setAutoJoinCode] = useState<string | null>(null);

  // Detectar si hay un código de sala en la URL para auto-abrir el modal
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode && joinCode.length === 6) {
      console.log('🔗 Enlace compartido detectado, código:', joinCode);
      setAutoJoinCode(joinCode.toUpperCase());
      setJoinFormOpen(true);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const texts = {
    es: {
      title: 'Bienvenido a Space Party',
      subtitle: 'La mejor plataforma para juegos multijugador en fiestas',
      joinRoom: 'Unirse a una Sala',
      createRoom: 'Crear Sala',
      joinDesc: 'Únete a una sala existente usando el código de acceso',
      createDesc: 'Crea tu propia sala y invita a tus amigos',
      features: {
        title: 'Características',
        easy: 'Fácil de usar',
        easyDesc: 'Comienza a jugar en menos de 1 minuto',
        multiplayer: 'Multijugador',
        multiplayerDesc: 'Hasta 20 jugadores en una sola sala',
        games: 'Minijuegos',
        gamesDesc: 'Variedad de juegos divertidos y competitivos',
      },
    },
    en: {
      title: 'Welcome to Space Party',
      subtitle: 'The best platform for multiplayer party games',
      joinRoom: 'Join a Room',
      createRoom: 'Create Room',
      joinDesc: 'Join an existing room using the access code',
      createDesc: 'Create your own room and invite your friends',
      features: {
        title: 'Features',
        easy: 'Easy to use',
        easyDesc: 'Start playing in less than 1 minute',
        multiplayer: 'Multiplayer',
        multiplayerDesc: 'Up to 20 players in a single room',
        games: 'Minigames',
        gamesDesc: 'Variety of fun and competitive games',
      },
    },
  };

  const t = texts[state.language];

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <div className="landing-icon-center">
            <Rocket size={48} color="#fff" strokeWidth={2.5} />
          </div>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#a78bfa', fontSize: { xs: '2rem', md: '2.8rem' } }}>
            {t.title}
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            {t.subtitle}
          </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: 6 }}>
          <Grid size={{xs:12, md:6}} display="flex">
            <Box className="landing-card" flex={1}>
              <div className="landing-icon-circle secondary">
                <Users size={40} color="#fff" />
              </div>
              <div className="landing-card-title" style={{ color: '#06b6d4' }}>{t.joinRoom}</div>
              <div className="landing-card-desc">{t.joinDesc}</div>
              <Button
                className="landing-btn-cyan"
                onClick={() => setJoinFormOpen(true)}
                startIcon={<Users size={20} />}
                fullWidth
                size="large"
              >
                {t.joinRoom}
              </Button>
            </Box>
          </Grid>
          <Grid size={{xs:12, md:6}} display="flex">
            <Box className="landing-card" flex={1}>
              <div className="landing-icon-circle purple">
                <Plus size={40} color="#fff" />
              </div>
              <div className="landing-card-title" style={{ color: '#a78bfa' }}>{t.createRoom}</div>
              <div className="landing-card-desc">{t.createDesc}</div>
              <Button
                className="landing-btn-purple"
                onClick={() => setCreateFormOpen(true)}
                startIcon={<Plus size={20} />}
                fullWidth
                size="large"
              >
                {t.createRoom}
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
          {t.features.title}
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          <Grid size={{xs:12, md:4}} display="flex">
            <Box className="landing-features-card" flex={1}>
              <div className="landing-features-icon green">
                <Zap size={32} />
              </div>
              <div className="landing-features-title" style={{ color: '#10b981' }}>{t.features.easy}</div>
              <div className="landing-features-desc">{t.features.easyDesc}</div>
            </Box>
          </Grid>
          <Grid size={{xs:12, md:4}} display="flex">
            <Box className="landing-features-card" flex={1}>
              <div className="landing-features-icon yellow">
                <Users size={32} />
              </div>
              <div className="landing-features-title" style={{ color: '#f59e0b' }}>{t.features.multiplayer}</div>
              <div className="landing-features-desc">{t.features.multiplayerDesc}</div>
            </Box>
          </Grid>
          <Grid size={{xs:12, md:4}} display="flex">
            <Box className="landing-features-card" flex={1}>
              <div className="landing-features-icon red">
                <Trophy size={32} />
              </div>
              <div className="landing-features-title" style={{ color: '#ef4444' }}>{t.features.games}</div>
              <div className="landing-features-desc">{t.features.gamesDesc}</div>
            </Box>
          </Grid>
        </Grid>
        <JoinRoomForm
          open={joinFormOpen}
          onClose={() => {
            setJoinFormOpen(false);
            setAutoJoinCode(null);
          }}
          prefilledCode={autoJoinCode}
        />
        <CreateRoomWizard
          open={createFormOpen}
          onClose={() => setCreateFormOpen(false)}
        />
      </Container>
    </Layout>
  );
};

export default LandingPage;