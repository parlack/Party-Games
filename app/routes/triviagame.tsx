import React, { useEffect, useState } from 'react';
import { useGame } from '../context/gamecontext';
import { useNavigate } from 'react-router';
import { 
  TriviaQuestionComponent, 
  TriviaRanking, 
  TriviaResults, 
  TriviaWaiting, 
  TriviaControls 
} from '../components/ui/triviacomponents';
import { Layout } from '../components/layouts/layout';
import { Container } from '@mui/material';

export default function TriviaGame() {
  const { state, submitAnswer, nextQuestion } = useGame();
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);

  // Verificar acceso a la trivia
  useEffect(() => {
    if (!state.currentRoom || !state.currentPlayer) {
      navigate('/');
      return;
    }

    if (!state.triviaState || !state.triviaState.isActive) {
      navigate('/waitingroom');
      return;
    }
  }, [state.currentRoom, state.currentPlayer, state.triviaState, navigate]);

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
        navigate('/waitingroom');
      }, 10000); // 10 segundos para ver resultados finales
      
      return () => clearTimeout(timer);
    }
  }, [state.triviaState?.isCompleted, navigate]);

  if (!state.currentRoom || !state.currentPlayer || !state.triviaState) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">🎯 Cargando Trivia...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </Container>
      </Layout>
    );
  }

  const { triviaState, currentPlayer } = state;
  const currentQuestion = triviaState.currentQuestion;
  const hasAnswered = currentPlayer.id in triviaState.playerAnswers;
  const playersAnswered = Object.keys(triviaState.playerAnswers).length;
  const totalPlayers = state.currentRoom.players.filter(p => !p.isSpectator && !p.isTV).length;

  const handleAnswer = (answer: string, timeUsed: number) => {
    submitAnswer(answer, timeUsed);
  };

  const handleNextQuestion = () => {
    nextQuestion();
    setShowResults(false);
  };

  // Calcular tiempo restante
  const timeElapsed = Date.now() - triviaState.questionStartTime;
  const timeRemaining = Math.max(0, triviaState.timeLimit - timeElapsed);

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <div className="max-w-4xl mx-auto">
          {/* Header de la trivia */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              🎯 Trivia Game
            </h1>
            <p className="text-white/80">
              Sala: {state.currentRoom.code} • 
              Pregunta {triviaState.currentQuestionIndex + 1} de {triviaState.questions.length}
            </p>
          </div>

          {/* Contenido principal */}
          <div className="space-y-6">
            {/* Trivia completada - Resultados finales */}
            {triviaState.isCompleted && triviaState.finalScores ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    🏆 ¡Trivia Completada!
                  </h2>
                  {triviaState.winner && (
                    <p className="text-white/90 text-lg">
                      Ganador: <span className="font-bold">{triviaState.winner.playerName}</span>
                    </p>
                  )}
                </div>
                <TriviaRanking 
                  scores={triviaState.finalScores} 
                  currentPlayerId={currentPlayer.id}
                  showFinal={true}
                />
                <div className="text-center">
                  <button
                    onClick={() => navigate('/waitingroom')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Volver a la Sala
                  </button>
                </div>
              </div>
            ) : showResults && currentQuestion ? (
              /* Mostrar resultados de la pregunta actual */
              <TriviaResults
                question={currentQuestion}
                correctAnswer={currentQuestion.correctAnswer}
                scores={triviaState.scores}
                currentPlayerId={currentPlayer.id}
                nextQuestionIn={triviaState.nextQuestionCountdown}
              />
            ) : currentQuestion ? (
              /* Pregunta activa */
              <div className="space-y-6">
                {/* Mostrar pregunta si el jugador no ha respondido */}
                {!hasAnswered ? (
                  <TriviaQuestionComponent
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    timeLimit={triviaState.timeLimit}
                    hasAnswered={hasAnswered}
                  />
                ) : (
                  /* Mostrar estado de espera si ya respondió */
                  <TriviaWaiting
                    playersAnswered={playersAnswered}
                    totalPlayers={totalPlayers}
                    timeRemaining={timeRemaining}
                  />
                )}

                {/* Controles para el host */}
                <TriviaControls
                  isHost={currentPlayer.isHost}
                  onNextQuestion={handleNextQuestion}
                  canAdvance={playersAnswered === totalPlayers || timeRemaining <= 0}
                  questionNumber={triviaState.currentQuestionIndex + 1}
                  totalQuestions={triviaState.questions.length}
                />

                {/* Ranking actual - solo en desktop, no en TV */}
                {!currentPlayer.isTV && (
                  <div className="lg:fixed lg:top-4 lg:right-4 lg:w-80">
                    <TriviaRanking 
                      scores={triviaState.scores} 
                      currentPlayerId={currentPlayer.id}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Estado de carga */
              <div className="text-center text-white">
                <h2 className="text-xl font-bold mb-4">
                  🎯 Preparando siguiente pregunta...
                </h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
            )}
          </div>

          {/* Información del jugador */}
          <div className="fixed bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
            <p className="text-sm">
              👤 {currentPlayer.name}
              {currentPlayer.isHost && <span className="ml-2">👑</span>}
              {currentPlayer.isTV && <span className="ml-2">📺</span>}
            </p>
          </div>
        </div>
      </Container>
    </Layout>
  );
} 