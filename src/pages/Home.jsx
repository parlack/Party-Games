import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { useSocket } from '../context/SocketContext'
import { Users, GamepadIcon, Trophy, Sparkles } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const { isConnected, connectionError } = useSocket()
  const { registerPlayer, isRegistered, isLoading, error, clearError } = useGame()
  
  const [playerName, setPlayerName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  // Redirigir si ya está registrado
  useEffect(() => {
    if (isRegistered) {
      navigate('/lobby')
    }
  }, [isRegistered, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      return
    }

    if (isAdmin && adminPassword !== 'admin123') {
      alert('Contraseña de administrador incorrecta')
      return
    }

    clearError()
    registerPlayer(playerName.trim(), isAdmin)
  }

  const handleAdminToggle = () => {
    setIsAdmin(!isAdmin)
    setShowAdminPassword(!showAdminPassword)
    setAdminPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <GamepadIcon size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Party Games
          </h1>
          <p className="text-white/80 text-lg">
            ¡Únete a la diversión con tus amigos!
          </p>
        </motion.div>

        {/* Formulario de registro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-effect p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del jugador */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Tu nombre
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                maxLength={20}
                required
              />
            </div>

            {/* Toggle de administrador */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={handleAdminToggle}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  isAdmin ? 'bg-green-500' : 'bg-white/20'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isAdmin ? 'translate-x-5' : 'translate-x-0'
                  } mt-0.5 ml-0.5`}></div>
                </div>
                <span className="ml-3 text-white/90 text-sm">
                  Soy el administrador
                </span>
              </label>
            </div>

            {/* Contraseña de administrador */}
            {showAdminPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Contraseña de administrador
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  required
                />
              </motion.div>
            )}

            {/* Estado de conexión */}
            <div className="text-center">
              {!isConnected && (
                <div className="flex items-center justify-center space-x-2 text-yellow-300 mb-4">
                  <div className="loading-spinner w-4 h-4 border-2"></div>
                  <span className="text-sm">Conectando al servidor...</span>
                </div>
              )}
              
              {connectionError && (
                <div className="text-red-300 text-sm mb-4">
                  Error de conexión: {connectionError}
                </div>
              )}
              
              {error && (
                <div className="text-red-300 text-sm mb-4">
                  {error}
                </div>
              )}
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={!isConnected || isLoading || !playerName.trim()}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                !isConnected || isLoading || !playerName.trim()
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'btn-primary hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner w-5 h-5 border-2"></div>
                  <span>Registrando...</span>
                </div>
              ) : (
                <>
                  {isAdmin ? '🎮 Entrar como Admin' : '🎉 Unirse a la fiesta'}
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <div className="text-center">
            <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users size={20} className="text-white" />
            </div>
            <p className="text-white/80 text-xs">
              Multijugador
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy size={20} className="text-white" />
            </div>
            <p className="text-white/80 text-xs">
              Ranking
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles size={20} className="text-white" />
            </div>
            <p className="text-white/80 text-xs">
              Tiempo Real
            </p>
          </div>
        </motion.div>

        {/* Información */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-white/60 text-sm">
            Sin registros, solo diversión instantánea 🎈
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Home 