import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { useSocket } from '../context/SocketContext'
import { Trophy, Users, Play, Crown, Star, Zap } from 'lucide-react'

const Lobby = () => {
  const navigate = useNavigate()
  const { isConnected } = useSocket()
  const { 
    player, 
    isRegistered, 
    currentGame, 
    rankings, 
    playersOnline,
    joinGame,
    error,
    clearError
  } = useGame()

  // Redirigir si no está registrado
  useEffect(() => {
    if (!isRegistered) {
      navigate('/')
    }
  }, [isRegistered, navigate])

  // Redirigir a juego si ya está en uno
  useEffect(() => {
    if (currentGame?.status === 'playing') {
      navigate('/game')
    }
  }, [currentGame, navigate])

  const handleJoinGame = () => {
    if (currentGame && currentGame.status === 'waiting') {
      joinGame()
    }
  }

  const handleGoToAdmin = () => {
    if (player?.isAdmin) {
      navigate('/admin')
    }
  }

  const getRankPosition = (playerId) => {
    return rankings.findIndex(p => p.id === playerId) + 1
  }

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="text-yellow-400" size={20} />
      case 2:
        return <Star className="text-gray-400" size={20} />
      case 3:
        return <Zap className="text-orange-400" size={20} />
      default:
        return <span className="text-white/60 font-bold">#{position}</span>
    }
  }

  if (!isRegistered || !player) {
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
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                ¡Hola, {player.name}!
              </h1>
              <p className="text-white/80">
                {player.isAdmin ? '👑 Administrador' : '🎮 Jugador'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-white/90">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span className="text-sm">{playersOnline} jugadores</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy size={16} />
              <span className="text-sm">{player.score} puntos</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ranking */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-effect p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Trophy className="mr-2" size={24} />
                  Ranking de la Fiesta
                </h2>
                <span className="text-white/60 text-sm">
                  Actualizado en tiempo real
                </span>
              </div>
              
              <div className="space-y-3">
                {rankings.length > 0 ? (
                  rankings.map((rankedPlayer, index) => (
                    <motion.div
                      key={rankedPlayer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        rankedPlayer.id === player.id 
                          ? 'bg-white/20 border border-white/30' 
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">
                              {rankedPlayer.name}
                            </span>
                            {rankedPlayer.isAdmin && (
                              <Crown size={16} className="text-yellow-400" />
                            )}
                            {rankedPlayer.id === player.id && (
                              <span className="text-xs bg-blue-500 px-2 py-1 rounded text-white">
                                TÚ
                              </span>
                            )}
                          </div>
                          <div className="text-white/60 text-sm">
                            {rankedPlayer.gamesPlayed} juegos jugados
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {rankedPlayer.score}
                        </div>
                        <div className="text-white/60 text-sm">
                          puntos
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                    <p>¡Juega para aparecer en el ranking!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Panel de Control */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Tu posición */}
            <div className="glass-effect p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Tu Posición
              </h3>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {getRankPosition(player.id) || '--'}
                  </div>
                  <div className="text-white/60 text-sm">
                    posición
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {player.score}
                  </div>
                  <div className="text-white/60 text-sm">
                    puntos
                  </div>
                </div>
              </div>
            </div>

            {/* Juego actual */}
            <div className="glass-effect p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Estado del Juego
              </h3>
              
              {currentGame ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {currentGame.config.name}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      currentGame.status === 'waiting' 
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : currentGame.status === 'playing'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {currentGame.status === 'waiting' && '⏳ Esperando jugadores'}
                      {currentGame.status === 'playing' && '🎮 Jugando'}
                      {currentGame.status === 'finished' && '✅ Terminado'}
                    </div>
                  </div>
                  
                  <div className="text-center text-white/80">
                    <div className="text-sm mb-2">
                      Jugadores: {currentGame.players.length}
                    </div>
                    <div className="text-sm">
                      Puntos máximos: {currentGame.config.maxPoints}
                    </div>
                  </div>
                  
                  {currentGame.status === 'waiting' && (
                    <button
                      onClick={handleJoinGame}
                      className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                    >
                      <Play size={20} />
                      <span>Unirse al Juego</span>
                    </button>
                  )}
                  
                  {currentGame.status === 'playing' && (
                    <button
                      onClick={() => navigate('/game')}
                      className="w-full btn-secondary py-3 flex items-center justify-center space-x-2"
                    >
                      <Play size={20} />
                      <span>Ir al Juego</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-white/60">
                  <Play size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    No hay juegos activos
                  </p>
                  <p className="text-xs mt-2">
                    El administrador puede crear uno
                  </p>
                </div>
              )}
            </div>

            {/* Panel de administrador */}
            {player.isAdmin && (
              <div className="glass-effect p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Crown className="mr-2" size={20} />
                  Panel de Admin
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleGoToAdmin}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                  >
                    <span>🎮 Administrar Juegos</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/tv-ranking')}
                    className="w-full btn-secondary py-3 flex items-center justify-center space-x-2"
                  >
                    <span>📺 Mostrar en TV</span>
                  </button>
                </div>
              </div>
            )}
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

export default Lobby 