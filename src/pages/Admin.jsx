import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { Crown, Play, Square, Users, Brain, Zap, HelpCircle, ArrowLeft, Trophy } from 'lucide-react'

const Admin = () => {
  const navigate = useNavigate()
  const { 
    player, 
    isRegistered, 
    currentGame, 
    createGame, 
    startGame, 
    endGame,
    showRankingOnTV,
    rankings,
    playersOnline,
    error,
    clearError
  } = useGame()

  const [selectedGameType, setSelectedGameType] = useState('quiz')

  // Verificar permisos
  useEffect(() => {
    if (!isRegistered || !player?.isAdmin) {
      navigate('/')
    }
  }, [isRegistered, player, navigate])

  const gameTypes = [
    {
      id: 'quiz',
      name: 'Quiz Rápido',
      description: 'Preguntas de cultura general con tiempo limitado',
      icon: <Brain size={32} />,
      color: 'bg-blue-500',
      maxPoints: 100,
      duration: 60
    },
    {
      id: 'reflex',
      name: 'Reflejos',
      description: 'Reacciona lo más rápido posible a las señales',
      icon: <Zap size={32} />,
      color: 'bg-orange-500',
      maxPoints: 50,
      duration: 30
    },
    {
      id: 'memory',
      name: 'Memoria',
      description: 'Memoriza y repite secuencias de colores',
      icon: <HelpCircle size={32} />,
      color: 'bg-purple-500',
      maxPoints: 75,
      duration: 45
    }
  ]

  const handleCreateGame = () => {
    if (currentGame) {
      alert('Ya hay un juego activo. Finalízalo antes de crear otro.')
      return
    }
    
    createGame(selectedGameType)
  }

  const handleStartGame = () => {
    if (currentGame?.status === 'waiting') {
      startGame()
    }
  }

  const handleEndGame = () => {
    if (currentGame?.status === 'playing') {
      endGame()
    }
  }

  const handleShowRanking = () => {
    showRankingOnTV()
  }

  const getGameStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'playing':
        return 'bg-green-500/20 text-green-300'
      case 'finished':
        return 'bg-gray-500/20 text-gray-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (!isRegistered || !player?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/lobby')}
                className="bg-white/20 p-3 rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Crown size={32} className="text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Panel de Administrador
                  </h1>
                  <p className="text-white/80">
                    Gestiona los juegos de la fiesta
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-white/90">
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span className="text-sm">{playersOnline} jugadores</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy size={16} />
                <span className="text-sm">{rankings.length} en ranking</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control de Juegos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Juego Actual */}
            <div className="glass-effect p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Juego Actual
              </h2>
              
              {currentGame ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {currentGame.config.name}
                      </h3>
                      <p className="text-white/60">
                        {currentGame.players.length} jugadores unidos
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${getGameStatusColor(currentGame.status)}`}>
                      {currentGame.status === 'waiting' && '⏳ Esperando'}
                      {currentGame.status === 'playing' && '🎮 Jugando'}
                      {currentGame.status === 'finished' && '✅ Terminado'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {currentGame.config.maxPoints}
                      </div>
                      <div className="text-white/60 text-sm">
                        Puntos máximos
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {currentGame.config.duration}s
                      </div>
                      <div className="text-white/60 text-sm">
                        Duración
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {currentGame.players.length}
                      </div>
                      <div className="text-white/60 text-sm">
                        Jugadores
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {currentGame.status === 'waiting' && (
                      <button
                        onClick={handleStartGame}
                        className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2"
                      >
                        <Play size={20} />
                        <span>Iniciar Juego</span>
                      </button>
                    )}
                    
                    {currentGame.status === 'playing' && (
                      <button
                        onClick={handleEndGame}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Square size={20} />
                        <span>Finalizar Juego</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate('/game')}
                      className="flex-1 btn-secondary py-3 flex items-center justify-center space-x-2"
                    >
                      <span>👀 Ver Juego</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <Play size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No hay juegos activos</p>
                  <p className="text-sm">Crea un nuevo juego para empezar</p>
                </div>
              )}
            </div>

            {/* Crear Nuevo Juego */}
            <div className="glass-effect p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Crear Nuevo Juego
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {gameTypes.map((game) => (
                  <div
                    key={game.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedGameType === game.id
                        ? 'border-white/50 bg-white/20'
                        : 'border-white/20 bg-white/10 hover:border-white/30'
                    }`}
                    onClick={() => setSelectedGameType(game.id)}
                  >
                    <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center text-white mb-3`}>
                      {game.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {game.name}
                    </h3>
                    <p className="text-white/60 text-sm mb-3">
                      {game.description}
                    </p>
                    <div className="flex justify-between text-xs text-white/80">
                      <span>{game.maxPoints} pts</span>
                      <span>{game.duration}s</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleCreateGame}
                disabled={!!currentGame}
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  currentGame
                    ? 'bg-gray-500 cursor-not-allowed text-white/60'
                    : 'btn-primary hover:scale-105'
                }`}
              >
                {currentGame ? 'Finaliza el juego actual primero' : '🎮 Crear Juego'}
              </button>
            </div>
          </motion.div>

          {/* Panel de Control */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Ranking Rápido */}
            <div className="glass-effect p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top 5 Ranking
              </h3>
              
              <div className="space-y-3">
                {rankings.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">
                        {player.name}
                      </span>
                    </div>
                    <span className="text-white/80 font-semibold">
                      {player.score}
                    </span>
                  </div>
                ))}
                
                {rankings.length === 0 && (
                  <div className="text-center py-4 text-white/60">
                    <p className="text-sm">No hay jugadores en el ranking</p>
                  </div>
                )}
              </div>
            </div>

            {/* Controles de TV */}
            <div className="glass-effect p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Pantalla de TV
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleShowRanking}
                  className="w-full btn-secondary py-3 flex items-center justify-center space-x-2"
                >
                  <Trophy size={20} />
                  <span>Mostrar Ranking</span>
                </button>
                
                <button
                  onClick={() => navigate('/tv-ranking')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>📺 Abrir Vista TV</span>
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="glass-effect p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Estadísticas
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Jugadores conectados</span>
                  <span className="text-white font-bold">{playersOnline}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/80">En ranking</span>
                  <span className="text-white font-bold">{rankings.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Juegos activos</span>
                  <span className="text-white font-bold">{currentGame ? 1 : 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Admin 