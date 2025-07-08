import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { Clock, Trophy, Zap, Brain, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

const Game = () => {
  const navigate = useNavigate()
  const { currentGame, player, sendGameAnswer, isRegistered } = useGame()
  
  // Estados del juego
  const [gameState, setGameState] = useState({
    currentQuestion: 0,
    timeLeft: 0,
    score: 0,
    isPlaying: false,
    showResult: false,
    userAnswer: null,
    gameData: null
  })

  // Estados específicos por tipo de juego
  const [quizState, setQuizState] = useState({
    selectedAnswer: null,
    showCorrectAnswer: false
  })

  const [reflexState, setReflexState] = useState({
    showSignal: false,
    signalStartTime: null,
    reactionTime: null,
    round: 0,
    waitingForSignal: false
  })

  const [memoryState, setMemoryState] = useState({
    sequence: [],
    userSequence: [],
    showingSequence: false,
    sequenceIndex: 0,
    level: 1
  })

  // Verificar permisos
  useEffect(() => {
    if (!isRegistered || !currentGame) {
      navigate('/lobby')
    }
  }, [isRegistered, currentGame, navigate])

  // Inicializar juego
  useEffect(() => {
    if (currentGame && currentGame.status === 'playing') {
      initializeGame()
    }
  }, [currentGame])

  const initializeGame = () => {
    const config = currentGame.config
    
    setGameState({
      currentQuestion: 0,
      timeLeft: config.duration || 60,
      score: 0,
      isPlaying: true,
      showResult: false,
      userAnswer: null,
      gameData: config
    })

    if (currentGame.type === 'quiz') {
      setQuizState({
        selectedAnswer: null,
        showCorrectAnswer: false
      })
    } else if (currentGame.type === 'reflex') {
      setReflexState({
        showSignal: false,
        signalStartTime: null,
        reactionTime: null,
        round: 0,
        waitingForSignal: false
      })
      startReflexRound()
    } else if (currentGame.type === 'memory') {
      setMemoryState({
        sequence: [],
        userSequence: [],
        showingSequence: false,
        sequenceIndex: 0,
        level: 1
      })
      startMemoryRound()
    }
  }

  // Timer del juego
  useEffect(() => {
    let timer
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }))
      }, 1000)
    } else if (gameState.timeLeft === 0 && gameState.isPlaying) {
      endGame()
    }

    return () => clearInterval(timer)
  }, [gameState.isPlaying, gameState.timeLeft])

  // Funciones del Quiz
  const handleQuizAnswer = (answerIndex) => {
    if (!gameState.isPlaying || quizState.selectedAnswer !== null) return

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      showCorrectAnswer: true
    }))

    const question = gameState.gameData.questions[gameState.currentQuestion]
    const isCorrect = answerIndex === question.correct

    sendGameAnswer({
      questionIndex: gameState.currentQuestion,
      answer: answerIndex,
      timeLeft: gameState.timeLeft,
      correct: isCorrect
    })

    setTimeout(() => {
      if (gameState.currentQuestion < gameState.gameData.questions.length - 1) {
        nextQuestion()
      } else {
        endGame()
      }
    }, 2000)
  }

  const nextQuestion = () => {
    setGameState(prev => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1
    }))
    setQuizState({
      selectedAnswer: null,
      showCorrectAnswer: false
    })
  }

  // Funciones de Reflejos
  const startReflexRound = useCallback(() => {
    setReflexState(prev => ({
      ...prev,
      round: prev.round + 1,
      showSignal: false,
      waitingForSignal: true,
      reactionTime: null
    }))

    const delay = Math.random() * 3000 + 2000 // 2-5 segundos
    setTimeout(() => {
      setReflexState(prev => ({
        ...prev,
        showSignal: true,
        signalStartTime: Date.now(),
        waitingForSignal: false
      }))
    }, delay)
  }, [])

  const handleReflexClick = () => {
    if (reflexState.waitingForSignal) {
      // Clicked too early
      setReflexState(prev => ({
        ...prev,
        reactionTime: -1 // Indica que fue muy temprano
      }))
      
      sendGameAnswer({
        reactionTime: -1,
        round: reflexState.round,
        early: true
      })
      
      setTimeout(() => {
        if (reflexState.round < 5) {
          startReflexRound()
        } else {
          endGame()
        }
      }, 2000)
    } else if (reflexState.showSignal) {
      const reactionTime = Date.now() - reflexState.signalStartTime
      
      setReflexState(prev => ({
        ...prev,
        reactionTime,
        showSignal: false
      }))
      
      sendGameAnswer({
        reactionTime,
        round: reflexState.round
      })
      
      setTimeout(() => {
        if (reflexState.round < 5) {
          startReflexRound()
        } else {
          endGame()
        }
      }, 2000)
    }
  }

  // Funciones de Memoria
  const startMemoryRound = useCallback(() => {
    const colors = ['red', 'blue', 'green', 'yellow']
    const newSequence = [...memoryState.sequence, colors[Math.floor(Math.random() * colors.length)]]
    
    setMemoryState(prev => ({
      ...prev,
      sequence: newSequence,
      userSequence: [],
      showingSequence: true,
      sequenceIndex: 0
    }))
    
    showSequence(newSequence)
  }, [memoryState.sequence])

  const showSequence = (sequence) => {
    sequence.forEach((color, index) => {
      setTimeout(() => {
        setMemoryState(prev => ({
          ...prev,
          sequenceIndex: index
        }))
      }, index * 800)
    })
    
    setTimeout(() => {
      setMemoryState(prev => ({
        ...prev,
        showingSequence: false,
        sequenceIndex: 0
      }))
    }, sequence.length * 800)
  }

  const handleMemoryColor = (color) => {
    if (memoryState.showingSequence) return
    
    const newUserSequence = [...memoryState.userSequence, color]
    setMemoryState(prev => ({
      ...prev,
      userSequence: newUserSequence
    }))
    
    const expectedColor = memoryState.sequence[newUserSequence.length - 1]
    
    if (color !== expectedColor) {
      // Wrong color
      sendGameAnswer({
        correct: false,
        level: memoryState.level,
        sequence: memoryState.sequence,
        userSequence: newUserSequence
      })
      endGame()
    } else if (newUserSequence.length === memoryState.sequence.length) {
      // Correct sequence completed
      sendGameAnswer({
        correct: true,
        level: memoryState.level,
        sequence: memoryState.sequence,
        userSequence: newUserSequence
      })
      
      setTimeout(() => {
        if (memoryState.level < 5) {
          setMemoryState(prev => ({
            ...prev,
            level: prev.level + 1,
            userSequence: []
          }))
          startMemoryRound()
        } else {
          endGame()
        }
      }, 1000)
    }
  }

  const endGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      showResult: true
    }))
    
    setTimeout(() => {
      navigate('/lobby')
    }, 5000)
  }

  const getColorClass = (color) => {
    const classes = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500'
    }
    return classes[color] || 'bg-gray-500'
  }

  if (!currentGame || !gameState.isPlaying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-white">Cargando juego...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header del juego */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/lobby')}
              className="bg-white/20 p-3 rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {currentGame.config.name}
              </h1>
              <p className="text-white/80">
                {player.name} - {player.score} puntos
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-white">
            <div className="flex items-center space-x-2">
              <Clock size={20} />
              <span className="text-2xl font-bold">{gameState.timeLeft}s</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy size={20} />
              <span className="text-xl">{gameState.score}</span>
            </div>
          </div>
        </div>

        {/* Área del juego */}
        <div className="glass-effect p-8 rounded-3xl">
          <AnimatePresence mode="wait">
            {/* Quiz Game */}
            {currentGame.type === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {gameState.gameData.questions[gameState.currentQuestion] && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <Brain size={48} className="text-blue-400 mr-4" />
                        <h2 className="text-4xl font-bold text-white">
                          Pregunta {gameState.currentQuestion + 1}
                        </h2>
                      </div>
                      <p className="text-2xl text-white/90 mb-8">
                        {gameState.gameData.questions[gameState.currentQuestion].question}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {gameState.gameData.questions[gameState.currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuizAnswer(index)}
                          disabled={quizState.selectedAnswer !== null}
                          className={`p-6 rounded-lg text-xl font-semibold transition-all ${
                            quizState.selectedAnswer === index
                              ? quizState.showCorrectAnswer && index === gameState.gameData.questions[gameState.currentQuestion].correct
                                ? 'bg-green-500 text-white'
                                : quizState.showCorrectAnswer
                                ? 'bg-red-500 text-white'
                                : 'bg-blue-500 text-white'
                              : quizState.showCorrectAnswer && index === gameState.gameData.questions[gameState.currentQuestion].correct
                              ? 'bg-green-500 text-white'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reflex Game */}
            {currentGame.type === 'reflex' && (
              <motion.div
                key="reflex"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-8">
                  <Zap size={48} className="text-orange-400 mr-4" />
                  <h2 className="text-4xl font-bold text-white">
                    Reflejos - Ronda {reflexState.round}
                  </h2>
                </div>
                
                <div className="space-y-8">
                  {reflexState.waitingForSignal && (
                    <div className="text-2xl text-white/90">
                      Espera la señal...
                    </div>
                  )}
                  
                  <div
                    onClick={handleReflexClick}
                    className={`w-96 h-96 mx-auto rounded-full cursor-pointer transition-all duration-300 ${
                      reflexState.showSignal
                        ? 'bg-green-500 animate-pulse'
                        : reflexState.waitingForSignal
                        ? 'bg-red-500/50'
                        : 'bg-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-center h-full">
                      {reflexState.showSignal && (
                        <div className="text-white text-2xl font-bold">
                          ¡AHORA!
                        </div>
                      )}
                      {reflexState.waitingForSignal && (
                        <div className="text-white text-xl">
                          Espera...
                        </div>
                      )}
                      {reflexState.reactionTime !== null && (
                        <div className="text-white text-xl">
                          {reflexState.reactionTime === -1 ? (
                            <XCircle size={48} className="text-red-400" />
                          ) : (
                            <div>
                              <CheckCircle size={48} className="text-green-400 mb-2" />
                              <div>{reflexState.reactionTime}ms</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-white/80">
                    {reflexState.reactionTime === -1 ? (
                      "¡Muy temprano! Espera la señal verde."
                    ) : reflexState.reactionTime ? (
                      `¡Bien! Tiempo de reacción: ${reflexState.reactionTime}ms`
                    ) : (
                      "Haz clic cuando veas la señal verde"
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Memory Game */}
            {currentGame.type === 'memory' && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-8">
                  <Brain size={48} className="text-purple-400 mr-4" />
                  <h2 className="text-4xl font-bold text-white">
                    Memoria - Nivel {memoryState.level}
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <div className="text-2xl text-white/90">
                    {memoryState.showingSequence ? "Memoriza la secuencia" : "Repite la secuencia"}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-96 mx-auto">
                    {['red', 'blue', 'green', 'yellow'].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleMemoryColor(color)}
                        disabled={memoryState.showingSequence}
                        className={`w-32 h-32 rounded-lg transition-all ${
                          memoryState.showingSequence && 
                          memoryState.sequence[memoryState.sequenceIndex] === color
                            ? `${getColorClass(color)} opacity-100 scale-110`
                            : `${getColorClass(color)} opacity-50 hover:opacity-80`
                        }`}
                      >
                        <span className="text-white font-bold capitalize">
                          {color}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-white/80">
                    Secuencia: {memoryState.sequence.length} colores
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resultado final */}
        {gameState.showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <div className="glass-effect p-12 rounded-3xl text-center">
              <Trophy size={80} className="text-yellow-400 mx-auto mb-6" />
              <h2 className="text-5xl font-bold text-white mb-4">
                ¡Juego Terminado!
              </h2>
              <p className="text-2xl text-white/90 mb-8">
                Tu puntuación final: {player.score} puntos
              </p>
              <div className="text-white/70">
                Regresando al lobby en unos segundos...
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Game 