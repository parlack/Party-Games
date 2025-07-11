import React from 'react';
import { Card, CardContent, Avatar, Typography, Box, Chip, Fade } from '@mui/material';
import { Crown, Eye, User, Clock } from 'lucide-react';
import type { Player } from '../../types/game';

interface PlayerCardProps {
  player: Player;
  language: 'es' | 'en';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, language }) => {
  const texts = {
    es: {
      host: 'Anfitrión',
      spectator: 'Espectador',
      joinedAt: 'Se unió',
    },
    en: {
      host: 'Host',
      spectator: 'Spectator',
      joinedAt: 'Joined',
    },
  };

  const t = texts[language];

  return (
    <Fade in timeout={500}>
      <Card 
        sx={{ 
          mb: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateX(8px) scale(1.02)',
            boxShadow: '0 12px 40px 0 rgba(99, 102, 241, 0.2)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              sx={{ 
                bgcolor: player.isHost 
                  ? 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)'
                  : player.isSpectator
                  ? 'linear-gradient(45deg, #06b6d4 30%, #22d3ee 90%)'
                  : 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                width: 56,
                height: 56,
                boxShadow: player.isHost 
                  ? '0 4px 14px 0 rgba(99, 102, 241, 0.4)'
                  : player.isSpectator
                  ? '0 4px 14px 0 rgba(6, 182, 212, 0.4)'
                  : '0 4px 14px 0 rgba(16, 185, 129, 0.4)',
              }}
            >
              <User size={24} style={{ color: 'white' }} />
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  {player.name}
                </Typography>
                {player.isHost && (
                  <Chip
                    icon={<Crown size={16} />}
                    label={t.host}
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                      color: 'white',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px 0 rgba(245, 158, 11, 0.3)',
                    }}
                  />
                )}
                {player.isSpectator && (
                  <Chip
                    icon={<Eye size={16} />}
                    label={t.spectator}
                    size="small"
                    color="secondary"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} color="#06b6d4" />
                <Typography variant="body2" color="text.secondary">
                  {t.joinedAt}: {player.joinedAt.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
            
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #10b981 30%, #34d399 90%)',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                animation: 'pulse 2s infinite',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};