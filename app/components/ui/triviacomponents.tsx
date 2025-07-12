import React, { useState, useEffect } from 'react';
import type { TriviaQuestion, PlayerScore, TriviaState } from '../../types/game';
import { useGame } from '../../context/gamecontext';

interface TriviaQuestionProps {
  question: TriviaQuestion;
  onAnswer: (answer: string, timeUsed: number) => void;
  timeLimit: number;
  hasAnswered: boolean;
}

export function TriviaQuestionComponent({ question, onAnswer, timeLimit, hasAnswered }: TriviaQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeRemaining(remaining);
      
      if (remaining === 0 && !hasAnswered) {
        handleAnswer(''); // Respuesta vacía por timeout
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, timeLimit, hasAnswered]);

  const handleAnswer = (answer: string) => {
    if (hasAnswered) return;
    
    const timeUsed = Date.now() - startTime;
    setSelectedAnswer(answer);
    onAnswer(answer, timeUsed);
  };

  const progressPercentage = (timeRemaining / timeLimit) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Barra de progreso de tiempo */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Tiempo restante</span>
          <span>{Math.ceil(timeRemaining / 1000)}s</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-100 ${
              progressPercentage > 50 ? 'bg-green-500' : 
              progressPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Información de la pregunta */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {question.category}
          </span>
          <span className={`text-sm px-2 py-1 rounded ${
            question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty === 'easy' ? 'Fácil' : 
             question.difficulty === 'medium' ? 'Medio' : 'Difícil'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {question.question}
        </h2>
      </div>

      {/* Opciones de respuesta */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={hasAnswered}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              hasAnswered 
                ? selectedAnswer === option 
                  ? 'bg-blue-100 border-blue-500 text-blue-800' 
                  : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800'
            }`}
          >
            <div className="flex items-center">
              <span className="font-medium mr-3 text-gray-500">
                {String.fromCharCode(65 + index)}.
              </span>
              <span>{option}</span>
            </div>
          </button>
        ))}
      </div>

      {hasAnswered && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-center">
            ✅ Respuesta enviada. Esperando a otros jugadores...
          </p>
        </div>
      )}
    </div>
  );
}

interface TriviaRankingProps {
  scores: PlayerScore[];
  currentPlayerId?: string;
  showFinal?: boolean;
}

export function TriviaRanking({ scores, currentPlayerId, showFinal = false }: TriviaRankingProps) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {showFinal ? '🏆 Ranking Final' : '📊 Ranking Actual'}
      </h2>
      
      <div className="space-y-3">
        {sortedScores.map((score, index) => (
          <div
            key={score.playerId}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${
              score.playerId === currentPlayerId 
                ? 'bg-blue-50 border-blue-300' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <span className={`font-bold text-lg mr-3 ${
                index === 0 ? 'text-yellow-600' :
                index === 1 ? 'text-gray-600' :
                index === 2 ? 'text-orange-600' :
                'text-gray-500'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {score.playerName}
                  {score.playerId === currentPlayerId && (
                    <span className="text-blue-600 text-sm ml-2">(Tú)</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {score.correctAnswers}/{score.totalAnswers} correctas
                  {score.averageTime > 0 && (
                    <span className="ml-2">
                      • {(score.averageTime / 1000).toFixed(1)}s promedio
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-800">
                {score.score}
              </span>
              <p className="text-sm text-gray-600">puntos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TriviaResultsProps {
  question: TriviaQuestion;
  correctAnswer: string;
  scores: PlayerScore[];
  currentPlayerId?: string;
  nextQuestionIn?: number;
}

export function TriviaResults({ 
  question, 
  correctAnswer, 
  scores, 
  currentPlayerId, 
  nextQuestionIn 
}: TriviaResultsProps) {
  const [countdown, setCountdown] = useState(nextQuestionIn || 0);

  useEffect(() => {
    if (nextQuestionIn && nextQuestionIn > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [nextQuestionIn]);

  return (
    <div className="space-y-6">
      {/* Respuesta correcta */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ✅ Respuesta Correcta
        </h3>
        <p className="text-green-700 text-lg">
          {correctAnswer}
        </p>
      </div>

      {/* Countdown para siguiente pregunta */}
      {countdown > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 font-medium">
            Siguiente pregunta en {Math.ceil(countdown / 1000)} segundos...
          </p>
        </div>
      )}

      {/* Ranking actualizado */}
      <TriviaRanking scores={scores} currentPlayerId={currentPlayerId} />
    </div>
  );
}

interface TriviaWaitingProps {
  playersAnswered: number;
  totalPlayers: number;
  timeRemaining: number;
}

export function TriviaWaiting({ playersAnswered, totalPlayers, timeRemaining }: TriviaWaitingProps) {
  const progressPercentage = (playersAnswered / totalPlayers) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        ⏳ Esperando respuestas...
      </h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          {playersAnswered} de {totalPlayers} jugadores han respondido
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="h-3 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {timeRemaining > 0 && (
        <p className="text-sm text-gray-500">
          Tiempo restante: {Math.ceil(timeRemaining / 1000)}s
        </p>
      )}
    </div>
  );
}

interface TriviaControlsProps {
  isHost: boolean;
  onNextQuestion: () => void;
  canAdvance: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export function TriviaControls({ 
  isHost, 
  onNextQuestion, 
  canAdvance, 
  questionNumber, 
  totalQuestions 
}: TriviaControlsProps) {
  if (!isHost) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Pregunta {questionNumber} de {totalQuestions}
        </div>
        <button
          onClick={onNextQuestion}
          disabled={!canAdvance}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            canAdvance
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {questionNumber < totalQuestions ? 'Siguiente Pregunta' : 'Finalizar Trivia'}
        </button>
      </div>
    </div>
  );
} 