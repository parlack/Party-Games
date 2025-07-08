import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { Trophy, Crown, Star, Medal, Zap, Sparkles } from 'lucide-react'

const TVRanking = () => {
  const { rankings, playersOnline, currentGame } = useGame()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showFireworks, setShowFireworks] = useState(false)

  // Actualizar la hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Mostrar fuegos artificiales al cambiar el ranking
  useEffect(() => {
    if (rankings.length > 0) {
      setShowFireworks(true)
      const timer = setTimeout(() => {
        setShowFireworks(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [rankings])

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="text-yellow-400" size={48} />
      case 2:
        return <Star className="text-gray-300" size={40} />
      case 3:
        return <Medal className="text-orange-400" size={36} />
      default:
        return <Zap className="text-blue-400" size={32} />
    }
  }

  const getRankColor = (position) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600'
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600'
    }
  }

  const getPositionText = (position) => {
    switch (position) {
      case 1:
        return '1ER LUGAR'
      case 2:
        return '2DO LUGAR'
      case 3:
        return '3ER LUGAR'
      default:
        return `${position}° LUGAR`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Fuegos artificiales */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <Sparkles size={32} className="text-yellow-400 animate-ping" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 p-8 h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Trophy size={80} className="text-yellow-400 mr-6" />
            <h1 className="text-8xl font-bold text-white tracking-wider">
              RANKING
            </h1>
            <Trophy size={80} className="text-yellow-400 ml-6" />
          </div>
          <p className="text-3xl text-white/80 font-medium">
            🎉 PARTY GAMES - RANKING EN VIVO 🎉
          </p>
        </motion.div>

        {/* Información del estado */}
        <div className="flex justify-between items-center mb-12 text-white/90">
          <div className="flex items-center space-x-8 text-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              <span>{playersOnline} jugadores conectados</span>
            </div>
            {currentGame && (
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Juego: {currentGame.config.name}</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-mono">
            {currentTime.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit' 
            })}
          </div>
        </div>

        {/* Ranking */}
        <div className="space-y-6">
          {rankings.length > 0 ? (
            rankings.slice(0, 10).map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`flex items-center justify-between p-8 rounded-3xl ${
                  index < 3 ? 'bg-white/20 border-2 border-white/30' : 'bg-white/10'
                } backdrop-blur-sm`}
              >
                <div className="flex items-center space-x-8">
                  {/* Posición */}
                  <div className="flex items-center space-x-4">
                    {getRankIcon(index + 1)}
                    <div className="text-center">
                      <div className={`px-6 py-2 rounded-full text-white font-bold text-2xl ${getRankColor(index + 1)}`}>
                        {getPositionText(index + 1)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Información del jugador */}
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-5xl font-bold text-white">
                        {player.name}
                      </span>
                      {player.isAdmin && (
                        <Crown size={32} className="text-yellow-400" />
                      )}
                    </div>
                    <div className="text-2xl text-white/70">
                      {player.gamesPlayed} juegos jugados
                    </div>
                  </div>
                </div>
                
                {/* Puntuación */}
                <div className="text-right">
                  <div className="text-6xl font-bold text-white mb-2">
                    {player.score}
                  </div>
                  <div className="text-2xl text-white/70">
                    puntos
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-center py-20"
            >
              <Trophy size={120} className="mx-auto mb-8 text-white/50" />
              <h2 className="text-6xl font-bold text-white mb-4">
                ¡Esperando Jugadores!
              </h2>
              <p className="text-3xl text-white/70">
                Únete a la fiesta y comienza a jugar
              </p>
            </motion.div>
          )}
        </div>

        {/* Pie de página */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="fixed bottom-8 left-0 right-0 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 inline-block">
            <p className="text-2xl text-white/90">
              🎮 Actualizado en tiempo real • Party Games 🎮
            </p>
          </div>
        </motion.div>

        {/* Efectos de partículas */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TVRanking 