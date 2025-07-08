import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSocket } from './SocketContext'

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame debe estar dentro de un GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const { socket, isConnected, on, off, emit } = useSocket()
  
  // Estado del jugador
  const [player, setPlayer] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  
  // Estado del juego
  const [currentGame, setCurrentGame] = useState(null)
  const [rankings, setRankings] = useState([])
  const [playersOnline, setPlayersOnline] = useState(0)
  const [gameHistory, setGameHistory] = useState([])
  
  // Estado de la UI
  const [showTVRanking, setShowTVRanking] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Función para registrar jugador
  const registerPlayer = (name, isAdmin = false) => {
    if (!isConnected) {
      setError('No hay conexión con el servidor')
      return
    }
    
    setIsLoading(true)
    emit('register-player', { name, isAdmin })
  }

  // Función para crear juego (solo admin)
  const createGame = (type) => {
    if (!player?.isAdmin) {
      setError('Solo el administrador puede crear juegos')
      return
    }
    
    emit('create-game', { type })
  }

  // Función para unirse a juego
  const joinGame = () => {
    if (!currentGame) {
      setError('No hay juego disponible')
      return
    }
    
    emit('join-game')
  }

  // Función para iniciar juego (solo admin)
  const startGame = () => {
    if (!player?.isAdmin) {
      setError('Solo el administrador puede iniciar juegos')
      return
    }
    
    emit('start-game')
  }

  // Función para finalizar juego (solo admin)
  const endGame = () => {
    if (!player?.isAdmin) {
      setError('Solo el administrador puede finalizar juegos')
      return
    }
    
    emit('end-game')
  }

  // Función para enviar respuesta de juego
  const sendGameAnswer = (answerData) => {
    emit('game-answer', answerData)
  }

  // Función para mostrar ranking en TV (solo admin)
  const showRankingOnTV = () => {
    if (!player?.isAdmin) {
      setError('Solo el administrador puede mostrar el ranking en TV')
      return
    }
    
    emit('show-tv-ranking')
  }

  // Función para agregar notificación
  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    const notification = { id, message, type, timestamp: new Date() }
    
    setNotifications(prev => [...prev, notification])
    
    // Remover notificación después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Función para limpiar error
  const clearError = () => {
    setError(null)
  }

  // Efectos para manejar eventos del socket
  useEffect(() => {
    if (!socket) return

    // Eventos de jugador
    const handlePlayerRegistered = (playerData) => {
      setPlayer(playerData)
      setIsRegistered(true)
      setIsLoading(false)
      addNotification(`¡Bienvenido, ${playerData.name}!`, 'success')
    }

    const handlePlayerJoined = (playerData) => {
      addNotification(`${playerData.name} se unió a la fiesta`, 'info')
    }

    const handlePlayerDisconnected = (playerData) => {
      addNotification(`${playerData.name} se desconectó`, 'warning')
    }

    // Eventos de juego
    const handleGameCreated = (gameData) => {
      setCurrentGame(gameData)
      addNotification(`Juego creado: ${gameData.config.name}`, 'success')
    }

    const handleGameJoined = (gameData) => {
      setCurrentGame(gameData)
      addNotification('Te uniste al juego', 'success')
    }

    const handleGameStarted = (gameData) => {
      setCurrentGame(gameData)
      addNotification('¡El juego ha comenzado!', 'success')
    }

    const handleGameEnded = (gameData) => {
      setCurrentGame(gameData)
      addNotification('El juego ha terminado', 'info')
    }

    const handleGameCancelled = () => {
      setCurrentGame(null)
      addNotification('El juego fue cancelado', 'warning')
    }

    const handleGameCleared = () => {
      setCurrentGame(null)
    }

    // Eventos de ranking
    const handleRankingsUpdated = (rankingsData) => {
      setRankings(rankingsData)
    }

    const handleTVRankingShow = (rankingsData) => {
      setShowTVRanking(true)
      setRankings(rankingsData)
    }

    // Eventos de puntuación
    const handlePointsAwarded = (data) => {
      if (player) {
        setPlayer(prev => ({ ...prev, score: data.totalScore }))
        addNotification(`¡Ganaste ${data.points} puntos!`, 'success')
      }
    }

    // Evento de estado actual
    const handleCurrentState = (stateData) => {
      setRankings(stateData.rankings)
      setCurrentGame(stateData.currentGame)
      setPlayersOnline(stateData.playersOnline)
    }

    // Eventos de error
    const handleError = (message) => {
      setError(message)
      setIsLoading(false)
      addNotification(message, 'error')
    }

    // Registrar event listeners
    on('player-registered', handlePlayerRegistered)
    on('player-joined', handlePlayerJoined)
    on('player-disconnected', handlePlayerDisconnected)
    on('game-created', handleGameCreated)
    on('game-joined', handleGameJoined)
    on('game-started', handleGameStarted)
    on('game-ended', handleGameEnded)
    on('game-cancelled', handleGameCancelled)
    on('game-cleared', handleGameCleared)
    on('rankings-updated', handleRankingsUpdated)
    on('tv-ranking-show', handleTVRankingShow)
    on('points-awarded', handlePointsAwarded)
    on('current-state', handleCurrentState)
    on('error', handleError)

    // Cleanup
    return () => {
      off('player-registered', handlePlayerRegistered)
      off('player-joined', handlePlayerJoined)
      off('player-disconnected', handlePlayerDisconnected)
      off('game-created', handleGameCreated)
      off('game-joined', handleGameJoined)
      off('game-started', handleGameStarted)
      off('game-ended', handleGameEnded)
      off('game-cancelled', handleGameCancelled)
      off('game-cleared', handleGameCleared)
      off('rankings-updated', handleRankingsUpdated)
      off('tv-ranking-show', handleTVRankingShow)
      off('points-awarded', handlePointsAwarded)
      off('current-state', handleCurrentState)
      off('error', handleError)
    }
  }, [socket, on, off, player])

  const value = {
    // Estado
    player,
    isRegistered,
    currentGame,
    rankings,
    playersOnline,
    gameHistory,
    showTVRanking,
    notifications,
    isLoading,
    error,
    
    // Funciones
    registerPlayer,
    createGame,
    joinGame,
    startGame,
    endGame,
    sendGameAnswer,
    showRankingOnTV,
    addNotification,
    clearError
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
} 