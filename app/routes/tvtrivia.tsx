import React, { useEffect, useState } from 'react';
import { useGame } from '../context/gamecontext';
import { useNavigate, useParams } from 'react-router';
import { 
  TriviaRanking, 
  TriviaResults 
} from '../components/ui/triviacomponents';
import { Layout } from '../components/layouts/layout';
import { Container, Typography, Box, LinearProgress } from '@mui/material';

export default function TVTrivia() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [showResults, setShowResults] = useState(false);

  // Verificar acceso TV
  useEffect(() => {
    if (!state.currentRoom || !state.currentPlayer) {
      navigate('/');
      return;
    }

    if (!state.currentPlayer.isTV) {
      navigate(`/trivia/${roomCode}`);
      return;
    }

    if (!state.triviaState || !state.triviaState.isActive) {
      navigate(`/tv/${roomCode}`);
      return;
    }
  }, [state.currentRoom, state.currentPlayer, state.triviaState, navigate, roomCode]);

  // Manejar cambios en el estado de trivia
  useEffect(() => {
    if (state.triviaState?.showResults) {
      setShowResults(true);
      
      // Auto-ocultar resultados después de unos segundos si hay siguiente pregunta
      if (state.triviaState.nextQuestionCountdown) {
        const timer = setTimeout(() => {
          setShowResults(false);
        }, state.triviaState.nextQuestionCountdown);
        
        return () => clearTimeout(timer);
      }
    }
  }, [state.triviaState?.showResults, state.triviaState?.nextQuestionCountdown]);

  // Redirigir si la trivia ha terminado
  useEffect(() => {
    if (state.triviaState?.isCompleted) {
      const timer = setTimeout(() => {
        navigate(`/tv/${roomCode}`);
      }, 15000); // 15 segundos para ver resultados finales en TV
      
      return () => clearTimeout(timer);
    }
  }, [state.triviaState?.isCompleted, navigate, roomCode]);

  if (!state.currentRoom || !state.currentPlayer || !state.triviaState) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ color: '#fff', mb: 4 }}>
            🎯 Cargando Trivia...
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        </Container>
      </Layout>
    );
  }

  const { triviaState, currentPlayer } = state;
  const currentQuestion = triviaState.currentQuestion;
  const playersAnswered = Object.keys(triviaState.playerAnswers).length;
  const totalPlayers = state.currentRoom.players.filter(p => !p.isSpectator && !p.isTV).length;

  // Calcular tiempo restante
  const timeElapsed = Date.now() - triviaState.questionStartTime;
  const timeRemaining = Math.max(0, triviaState.timeLimit - timeElapsed);
  const progressPercentage = (timeRemaining / triviaState.timeLimit) * 100;

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <div className="max-w-6xl mx-auto">
          {/* Header de la trivia */}
          <div className="text-center mb-8">
            <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 2 }}>
              🎯 Trivia Game - Vista TV
            </Typography>
            <Typography variant="h5" sx={{ color: '#b3b3ff', mb: 4 }}>
              Sala: {state.currentRoom.code} • 
              Pregunta {triviaState.currentQuestionIndex + 1} de {triviaState.questions.length}
            </Typography>
          </div>

          {/* Contenido principal */}
          <div className="space-y-8">
            {/* Trivia completada - Resultados finales */}
            {triviaState.isCompleted && triviaState.finalScores ? (
              <div className="space-y-8">
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: 4,
                  p: 6,
                  textAlign: 'center',
                  mb: 6
                }}>
                  <Typography variant="h1" sx={{ color: '#fff', fontWeight: 800, mb: 2 }}>
                    🏆 ¡Trivia Completada!
                  </Typography>
                  {triviaState.winner && (
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 600 }}>
                      Ganador: {triviaState.winner.playerName}
                    </Typography>
                  )}
                </Box>
                <TriviaRanking 
                  scores={triviaState.finalScores} 
                  showFinal={true}
                />
              </div>
            ) : showResults && currentQuestion ? (
              /* Mostrar resultados de la pregunta actual */
              <TriviaResults
                question={currentQuestion}
                correctAnswer={currentQuestion.correctAnswer}
                scores={triviaState.scores}
                nextQuestionIn={triviaState.nextQuestionCountdown}
              />
            ) : currentQuestion ? (
              /* Pregunta activa - Vista TV */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pregunta principal */}
                <div className="lg:col-span-2">
                  <Box sx={{
                    background: 'linear-gradient(135deg, #23244a 0%, #2d2250 100%)',
                    borderRadius: 4,
                    p: 6,
                    border: '2px solid #353570',
                    boxShadow: '0 8px 32px rgba(99,102,241,0.2)'
                  }}>
                    {/* Barra de progreso de tiempo */}
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#b3b3ff' }}>
                          Tiempo restante
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                          {Math.ceil(timeRemaining / 1000)}s
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progressPercentage}
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          backgroundColor: '#353570',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: progressPercentage > 50 ? '#10b981' : 
                                           progressPercentage > 25 ? '#f59e0b' : '#ef4444'
                          }
                        }}
                      />
                    </Box>

                    {/* Información de la pregunta */}
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ 
                          px: 3, py: 1, 
                          borderRadius: 2, 
                          background: '#6366f1',
                          color: '#fff',
                          fontWeight: 600
                        }}>
                          {currentQuestion.category}
                        </Box>
                        <Box sx={{ 
                          px: 3, py: 1, 
                          borderRadius: 2, 
                          background: currentQuestion.difficulty === 'easy' ? '#10b981' :
                                     currentQuestion.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                          color: '#fff',
                          fontWeight: 600
                        }}>
                          {currentQuestion.difficulty === 'easy' ? 'Fácil' : 
                           currentQuestion.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                        </Box>
                      </Box>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                        {currentQuestion.question}
                      </Typography>
                    </Box>

                    {/* Opciones de respuesta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '2px solid #353570',
                            background: '#2d2250',
                            color: '#fff'
                          }}
                        >
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            <span style={{ color: '#8b5cf6', marginRight: 16 }}>
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </Typography>
                        </Box>
                      ))}
                    </div>

                    {/* Estado de respuestas */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ color: '#b3b3ff', mb: 2 }}>
                        {playersAnswered} de {totalPlayers} jugadores han respondido
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(playersAnswered / totalPlayers) * 100}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: '#353570',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#6366f1'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </div>

                {/* Ranking lateral */}
                <div className="lg:col-span-1">
                  <TriviaRanking 
                    scores={triviaState.scores} 
                  />
                </div>
              </div>
            ) : (
              /* Estado de carga */
              <div className="text-center">
                <Typography variant="h3" sx={{ color: '#fff', mb: 4 }}>
                  🎯 Preparando siguiente pregunta...
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                  <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </div>
            )}
          </div>

          {/* Información de la sala */}
          <Box sx={{ 
            position: 'fixed', 
            bottom: 16, 
            left: 16, 
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            px: 3,
            py: 2,
            borderRadius: 2
          }}>
            <Typography variant="body1">
              📺 Vista TV • Sala: {state.currentRoom.code}
            </Typography>
          </Box>
        </div>
      </Container>
    </Layout>
  );
} 