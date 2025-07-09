import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

// Contraseña del host
const HOST_PASSWORD = "fiesta2025"

// Conexión Socket.IO - Compatible con desarrollo y producción
const socketUrl = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost' 
  ? window.location.origin 
  : 'http://localhost:3001'

// Configuración optimizada para GoDaddy - Solo polling en producción
const socket = io(socketUrl, {
  transports: window.location.hostname === 'localhost' 
    ? ['websocket', 'polling']  // En local usar WebSocket
    : ['polling'],              // En producción solo polling (más estable en GoDaddy)
  timeout: 20000,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 5,
  forceNew: true
})

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [playerName, setPlayerName] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [hostPassword, setHostPassword] = useState('')
  const [showConnectedUsers, setShowConnectedUsers] = useState(false)
  const [currentGame, setCurrentGame] = useState(null)
  const [gameState, setGameState] = useState('waiting') // waiting, playing, finished
  const [gameData, setGameData] = useState({})
  const [socketConnected, setSocketConnected] = useState(false)
  const [playerId, setPlayerId] = useState(null)
  
  // Estado de usuarios conectados (desde Socket.IO)
  const [connectedUsers, setConnectedUsers] = useState([])

  // Ranking de jugadores (desde Socket.IO)
  const [players, setPlayers] = useState([])

  // Configurar Socket.IO
  useEffect(() => {
    console.log('🔌 Configurando Socket.IO...')
    
    // Eventos de conexión
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO:', socket.id)
      setSocketConnected(true)
      setPlayerId(socket.id)
      
      // Solicitar estado actualizado al reconectar
      setTimeout(() => {
        console.log('🔄 Solicitando estado tras reconexión...')
        socket.emit('request-users-list')
      }, 1000)
    })

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor Socket.IO')
      setSocketConnected(false)
      setPlayerId(null)
    })

    socket.on('reconnect', () => {
      console.log('🔄 Reconectado al servidor Socket.IO')
      socket.emit('request-users-list')
    })

    socket.on('connect_error', (error) => {
      console.log('❌ Error de conexión:', error.message)
    })

    // Eventos de jugadores
    socket.on('player-registered', (player) => {
      console.log('👤 Jugador registrado:', player)
    })

    socket.on('player-joined', (player) => {
      console.log('➕ Jugador se unió:', player)
      setConnectedUsers(prev => {
        const exists = prev.find(u => u.id === player.id)
        if (!exists) {
          return [...prev, {
            id: player.id,
            name: player.name,
            isHost: player.isAdmin,
            connected: player.isOnline
          }]
        }
        return prev
      })
    })

    socket.on('player-disconnected', (player) => {
      console.log('➖ Jugador desconectado:', player)
      setConnectedUsers(prev => prev.filter(u => u.id !== player.id))
      
      // Si el jugador desconectado era yo, resetear estado
      if (player.id === socket.id) {
        setPlayerName('')
        setIsHost(false)
        setCurrentPage('home')
        setCurrentGame(null)
        setGameState('waiting')
      }
    })

    // Nuevo evento para sincronizar lista de usuarios conectados
    socket.on('users-list-updated', (usersList) => {
      console.log('👥 Lista de usuarios actualizada:', usersList)
      setConnectedUsers(usersList.map(user => ({
        id: user.id,
        name: user.name,
        isHost: user.isAdmin,
        connected: user.isOnline
      })))
    })

    // Eventos de ranking
    socket.on('rankings-updated', (rankings) => {
      console.log('🏆 Rankings actualizados:', rankings)
      setPlayers(rankings)
    })

    // Eventos de juego
    socket.on('game-created', (game) => {
      console.log('🎮 Juego creado:', game)
      setCurrentGame(game)
      setGameState('waiting')
    })

    socket.on('game-started', (game) => {
      console.log('🚀 Juego iniciado:', game)
      setCurrentGame(game)
      setGameState('playing')
      setCurrentPage('game')
    })

    socket.on('game-ended', (game) => {
      console.log('🏁 Juego terminado:', game)
      setGameState('finished')
      setCurrentPage('lobby')
    })

    socket.on('points-awarded', (data) => {
      console.log('🎯 Puntos otorgados:', data)
      alert(`¡Ganaste ${data.points} puntos! Total: ${data.totalScore}`)
    })

    socket.on('current-state', (state) => {
      console.log('📊 Estado actual del servidor:', state)
      setPlayers(state.rankings)
      if (state.currentGame) {
        setCurrentGame(state.currentGame)
        setGameState(state.currentGame.status)
      }
      
      // Solicitar lista de usuarios después de recibir el estado
      console.log('🔄 Solicitando lista de usuarios actualizada...')
    })

    socket.on('error', (error) => {
      console.error('❌ Error del servidor:', error)
      alert(`Error: ${error}`)
    })

    // Sincronización automática cada 10 segundos para compensar desconexiones
    const syncInterval = setInterval(() => {
      if (socketConnected && playerName) {
        console.log('🔄 Sincronización automática...')
        socket.emit('request-users-list')
      }
    }, 10000)

    // Cleanup
    return () => {
      clearInterval(syncInterval)
      socket.off('connect')
      socket.off('disconnect')
      socket.off('reconnect')
      socket.off('connect_error')
      socket.off('player-registered')
      socket.off('player-joined')
      socket.off('player-disconnected')
      socket.off('users-list-updated')
      socket.off('rankings-updated')
      socket.off('game-created')
      socket.off('game-started')
      socket.off('game-ended')
      socket.off('points-awarded')
      socket.off('current-state')
      socket.off('error')
    }
  }, [])

  // Preguntas para el quiz
  const quizQuestions = [
    {
      question: "¿Cuál es la capital de Francia?",
      options: ["Madrid", "París", "Roma", "Londres"],
      correct: 1
    },
    {
      question: "¿En qué año se fundó Facebook?",
      options: ["2003", "2004", "2005", "2006"],
      correct: 1
    },
    {
      question: "¿Cuál es el planeta más grande del sistema solar?",
      options: ["Tierra", "Marte", "Júpiter", "Saturno"],
      correct: 2
    },
    {
      question: "¿Quién escribió 'Cien años de soledad'?",
      options: ["Mario Vargas Llosa", "Gabriel García Márquez", "Jorge Luis Borges", "Pablo Neruda"],
      correct: 1
    }
  ]

  // Estilos base
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '30px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    button: {
      background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '25px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      margin: '5px'
    },
    buttonSecondary: {
      background: 'linear-gradient(45deg, #4ecdc4, #44d9a6)',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '25px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      margin: '5px'
    },
    input: {
      width: '100%',
      padding: '15px',
      fontSize: '16px',
      borderRadius: '10px',
      border: 'none',
      marginBottom: '20px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      outline: 'none',
      boxSizing: 'border-box'
    }
  }

  // Función para verificar contraseña de host
  const handleHostLogin = () => {
    if (hostPassword === HOST_PASSWORD) {
      setIsHost(true)
      setShowPasswordInput(false)
      setHostPassword('')
      alert('¡Bienvenido Host! 👑')
    } else {
      alert('Contraseña incorrecta')
      setHostPassword('')
    }
  }

  // Función para registrar jugador en el servidor
  const registerPlayer = () => {
    if (!socketConnected) {
      alert('No hay conexión con el servidor')
      return
    }
    
    console.log('📝 Registrando jugador:', playerName, 'Host:', isHost)
    socket.emit('register-player', {
      name: playerName,
      isAdmin: isHost
    })
  }

  // Función para iniciar juego (solo host)
  const startGame = (gameType) => {
    if (!isHost) {
      alert('Solo el host puede iniciar juegos')
      return
    }
    
    if (!socketConnected) {
      alert('No hay conexión con el servidor')
      return
    }
    
    console.log('🎮 Iniciando juego:', gameType)
    socket.emit('create-game', { type: gameType })
    
    // Configurar datos del juego según el tipo
    switch (gameType) {
      case 'quiz':
        setGameData({
          currentQuestion: 0,
          questions: quizQuestions,
          timeLeft: 30,
          userAnswers: []
        })
        break
      case 'reflex':
        setGameData({
          round: 1,
          maxRounds: 5,
          showSignal: false,
          reactionTimes: []
        })
        break
      case 'memory':
        setGameData({
          sequence: [],
          level: 1,
          maxLevel: 5,
          showingSequence: false
        })
        break
      default:
        break
    }
  }

  // Función para unirse al juego
  const joinGame = () => {
    if (!socketConnected) {
      alert('No hay conexión con el servidor')
      return
    }
    
    console.log('🎯 Uniéndose al juego')
    socket.emit('join-game')
  }

  // Función para iniciar el juego (solo host)
  const startGameSession = () => {
    if (!isHost) {
      alert('Solo el host puede iniciar la sesión de juego')
      return
    }
    
    if (!socketConnected) {
      alert('No hay conexión con el servidor')
      return
    }
    
    console.log('🚀 Iniciando sesión de juego')
    socket.emit('start-game')
  }

  // Panel de debugging
  const DebugPanel = () => (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1001,
      maxWidth: '300px'
    }}>
      <div><strong>🔍 DEBUG INFO:</strong></div>
      <div>👥 Usuarios conectados: {connectedUsers.length}</div>
      <div>📊 Jugadores en ranking: {players.length}</div>
      <div>🏠 Página actual: {currentPage}</div>
      <div>👤 Mi nombre: {playerName}</div>
      <div>👑 Soy host: {isHost ? 'Sí' : 'No'}</div>
      <div>🔌 Socket conectado: {socketConnected ? 'Sí' : 'No'}</div>
      <div>🆔 Socket ID: {playerId || 'N/A'}</div>
      <div>🎮 Juego actual: {currentGame?.type || 'Ninguno'}</div>
      <div>🎯 Estado juego: {gameState}</div>
      
      {/* Botón de debug para solicitar usuarios */}
      <button 
        onClick={() => {
          console.log('🔄 Solicitando lista de usuarios manualmente...')
          socket.emit('request-users-list')
        }}
        style={{
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '10px',
          margin: '5px 0',
          cursor: 'pointer'
        }}
      >
        🔄 Actualizar Lista
      </button>
      
      <div style={{ marginTop: '5px', fontSize: '10px' }}>
        <strong>Lista usuarios:</strong>
        {connectedUsers.map(u => (
          <div key={u.id}>• {u.name} {u.isHost ? '👑' : ''}</div>
        ))}
      </div>
    </div>
  )

  // Componente para mostrar usuarios conectados (solo en lobby y juegos)
  const ConnectedUsersPanel = ({ showInPage = true }) => {
    if (!showInPage) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          style={{
            ...styles.buttonSecondary,
            borderRadius: '50px',
            padding: '10px 20px',
            fontSize: '14px'
          }}
          onClick={() => setShowConnectedUsers(!showConnectedUsers)}
        >
          👥 {connectedUsers.filter(u => u.connected).length}
        </button>
        
        {showConnectedUsers && (
          <div style={{
            ...styles.glass,
            position: 'absolute',
            top: '50px',
            right: '0',
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <h4 style={{ marginBottom: '15px', fontSize: '1rem' }}>Usuarios Conectados</h4>
            {connectedUsers.filter(u => u.connected).length === 0 ? (
              <p style={{ fontSize: '14px', opacity: 0.7, textAlign: 'center' }}>
                No hay usuarios conectados
              </p>
            ) : (
              connectedUsers.filter(u => u.connected).map(user => (
                <div key={user.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <span style={{ fontSize: '14px' }}>
                    {user.name} {user.isHost && '👑'}
                  </span>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#4ade80' 
                  }}></span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  // Página de inicio
  const HomePage = () => (
    <div style={{
      ...styles.container,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ ...styles.glass, textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', animation: 'pulse 2s infinite' }}>
          🎮 Party Games
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>
          ¡Únete a la diversión con tus amigos!
        </p>
        
        {!socketConnected && (
          <div style={{ 
            background: 'rgba(255, 0, 0, 0.2)', 
            padding: '10px', 
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            ⚠️ No hay conexión con el servidor. Asegúrate de que el servidor esté corriendo.
          </div>
        )}
        
        <input
          type="text"
          placeholder="Ingresa tu nombre"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={styles.input}
          maxLength={20}
          autoFocus
        />
        
        {showPasswordInput && (
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              placeholder="Contraseña de host"
              value={hostPassword}
              onChange={(e) => setHostPassword(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleHostLogin()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button style={styles.buttonSecondary} onClick={handleHostLogin}>
                Confirmar
              </button>
              <button 
                style={{ ...styles.button, background: 'rgba(255,255,255,0.2)' }}
                onClick={() => {
                  setShowPasswordInput(false)
                  setHostPassword('')
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            style={styles.button}
            onClick={() => {
              if (playerName.trim() && socketConnected) {
                registerPlayer()
                setCurrentPage('lobby')
              } else if (!playerName.trim()) {
                alert('Por favor ingresa tu nombre')
              } else {
                alert('No hay conexión con el servidor')
              }
            }}
          >
            🎉 Unirse a la fiesta
          </button>
          
          <button
            style={styles.buttonSecondary}
            onClick={() => setShowPasswordInput(true)}
          >
            🔑 Soy el Host
          </button>
        </div>
        
        <div style={{ marginTop: '30px', fontSize: '14px', opacity: 0.8 }}>
          <p>🎯 Mini-juegos • 🏆 Ranking en tiempo real • 📺 Vista para TV</p>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            Contraseña del host: <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{HOST_PASSWORD}</code>
          </p>
          <button
            style={{
              ...styles.button,
              background: 'rgba(255, 255, 255, 0.1)',
              fontSize: '12px',
              padding: '8px 16px',
              marginTop: '10px'
            }}
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres reiniciar la aplicación?')) {
                window.location.reload()
              }
            }}
          >
            🔄 Reiniciar App
          </button>
        </div>
      </div>
    </div>
  )

  // Página del lobby
  const LobbyPage = () => (
    <div style={{ ...styles.container, padding: '20px' }}>
      <ConnectedUsersPanel showInPage={true} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            🎮 Lobby de Juegos
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            ¡Hola {playerName}! {isHost && '👑 HOST'} 
          </p>
          {currentGame && gameState === 'waiting' && (
            <div style={{ 
              background: 'rgba(255, 215, 0, 0.2)', 
              padding: '10px', 
              borderRadius: '10px',
              marginTop: '10px'
            }}>
              🎯 Juego preparado: <strong>{currentGame}</strong> - Esperando que el host lo inicie
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Ranking */}
          <div style={styles.glass}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              🏆 Ranking de la Fiesta
            </h2>
            
            {players.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ fontSize: '1rem', opacity: 0.7 }}>
                  No hay jugadores aún
                </p>
                <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>
                  Los puntos aparecerán cuando jueguen
                </p>
              </div>
            ) : (
              players.sort((a, b) => b.score - a.score).map((player, index) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{player.name}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{player.gamesPlayed} juegos</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{player.score}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>puntos</div>
                </div>
              </div>
              ))
            )}
          </div>

          {/* Panel de juegos */}
          <div style={styles.glass}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
              🎯 Mini-juegos {isHost && '(HOST)'}
            </h3>
            
            {isHost ? (
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '15px' }}>
                  Como host, puedes iniciar cualquier juego:
                </p>
                
                <button
                  style={{ ...styles.button, width: '100%', marginBottom: '15px', textAlign: 'left' }}
                  onClick={() => startGame('quiz')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>🧠 Quiz Rápido</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Preguntas de cultura general</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>100pts</div>
                  </div>
                </button>
                
                <button
                  style={{ ...styles.buttonSecondary, width: '100%', marginBottom: '15px', textAlign: 'left' }}
                  onClick={() => startGame('reflex')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>⚡ Test de Reflejos</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>¡Reacciona lo más rápido posible!</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>50pts</div>
                  </div>
                </button>
                
                <button
                  style={{ 
                    ...styles.button, 
                    width: '100%', 
                    marginBottom: '15px', 
                    textAlign: 'left',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)'
                  }}
                  onClick={() => startGame('memory')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>🧩 Memoria</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Recuerda la secuencia</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>75pts</div>
                  </div>
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⏳</div>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Esperando al host...</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  El host debe seleccionar un juego para comenzar
                </p>
              </div>
            )}

            {/* Botones de navegación */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
              {isHost && (
                <button
                  style={{ ...styles.buttonSecondary, width: '100%', marginBottom: '10px' }}
                  onClick={() => setCurrentPage('tv-ranking')}
                >
                  📺 Mostrar Ranking en TV
                </button>
              )}
              
              <button
                style={{ 
                  ...styles.button, 
                  width: '100%', 
                  background: 'rgba(255, 255, 255, 0.2)' 
                }}
                onClick={() => setCurrentPage('home')}
              >
                🏠 Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Página de juego (mejorada)
  const GamePage = () => {
    const renderGame = () => {
      switch (currentGame) {
        case 'quiz':
          return <QuizGame />
        case 'reflex':
          return <ReflexGame />
        case 'memory':
          return <MemoryGame />
        default:
          return <div>Juego no encontrado</div>
      }
    }

    return (
      <div style={{ ...styles.container, padding: '20px' }}>
        <ConnectedUsersPanel showInPage={true} />
        {renderGame()}
      </div>
    )
  }

  // Juego de Quiz
  const QuizGame = () => {
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [timeLeft, setTimeLeft] = useState(30)

    const currentQuestion = gameData.questions?.[gameData.currentQuestion]

    useEffect(() => {
      if (timeLeft > 0 && !showResult) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
        return () => clearTimeout(timer)
      } else if (timeLeft === 0 && !showResult) {
        setShowResult(true)
      }
    }, [timeLeft, showResult])

    const handleAnswer = (index) => {
      if (selectedAnswer !== null) return
      setSelectedAnswer(index)
      setShowResult(true)
      
      // Guardar respuesta
      const isCorrect = index === currentQuestion.correct
      setGameData(prev => ({
        ...prev,
        userAnswers: [...(prev.userAnswers || []), { correct: isCorrect }]
      }))
    }

    const nextQuestion = () => {
      if (gameData.currentQuestion < gameData.questions.length - 1) {
        setGameData(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeLeft(30)
      } else {
        // Fin del juego - enviar puntos al servidor
        const correctAnswers = gameData.userAnswers?.filter(answer => answer.correct).length || 0
        
        // Enviar respuesta final al servidor
        socket.emit('game-answer', {
          type: 'quiz_final',
          correctAnswers: correctAnswers,
          totalQuestions: gameData.questions.length
        })
        
        setGameState('finished')
        setCurrentPage('lobby')
        alert(`¡Quiz completado! 🎉\nRespuestas correctas: ${correctAnswers}`)
      }
    }

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={styles.glass}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '2rem' }}>🧠 Quiz Rápido</h1>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft <= 10 ? '#ff6b6b' : 'white' }}>
              ⏰ {timeLeft}s
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Pregunta {gameData.currentQuestion + 1} de {gameData.questions.length}
            </p>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '2px',
              marginTop: '10px'
            }}>
              <div style={{
                width: `${((gameData.currentQuestion + 1) / gameData.questions.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(45deg, #4ecdc4, #44d9a6)',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
            {currentQuestion?.question}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                style={{
                  ...styles.button,
                  background: showResult
                    ? index === currentQuestion.correct
                      ? 'linear-gradient(45deg, #4ade80, #22c55e)'
                      : index === selectedAnswer && index !== currentQuestion.correct
                      ? 'linear-gradient(45deg, #ef4444, #dc2626)'
                      : 'rgba(255, 255, 255, 0.2)'
                    : styles.button.background,
                  opacity: showResult && index !== currentQuestion.correct && index !== selectedAnswer ? 0.5 : 1
                }}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>

          {showResult && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                {selectedAnswer === currentQuestion.correct ? '🎉 ¡Correcto!' : '❌ Incorrecto'}
              </p>
              <button style={styles.buttonSecondary} onClick={nextQuestion}>
                {gameData.currentQuestion < gameData.questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Quiz'}
              </button>
            </div>
          )}
          
          <button
            style={{ ...styles.button, background: 'rgba(255, 255, 255, 0.2)' }}
            onClick={() => {
              setCurrentGame(null)
              setGameState('waiting')
              setCurrentPage('lobby')
            }}
          >
            ← Salir del Juego
          </button>
        </div>
      </div>
    )
  }

  // Juego de Reflejos
  const ReflexGame = () => {
    const [showSignal, setShowSignal] = useState(false)
    const [waiting, setWaiting] = useState(false)
    const [reactionTime, setReactionTime] = useState(null)
    const [startTime, setStartTime] = useState(null)

    const startRound = () => {
      setWaiting(true)
      setReactionTime(null)
      const delay = Math.random() * 3000 + 2000 // 2-5 segundos
      
      setTimeout(() => {
        setShowSignal(true)
        setStartTime(Date.now())
        setWaiting(false)
      }, delay)
    }

    const handleClick = () => {
      if (waiting) {
        // Demasiado temprano
        setWaiting(false)
        setReactionTime(-1)
        return
      }
      
      if (showSignal) {
        const time = Date.now() - startTime
        setReactionTime(time)
        setShowSignal(false)
      }
    }

    useEffect(() => {
      startRound()
    }, [])

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={styles.glass}>
          <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>⚡ Test de Reflejos</h1>
          
          <div
            onClick={handleClick}
            style={{
              width: '300px',
              height: '300px',
              margin: '0 auto 30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              background: showSignal 
                ? 'linear-gradient(45deg, #4ade80, #22c55e)'
                : waiting
                ? 'linear-gradient(45deg, #ef4444, #dc2626)'
                : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {waiting && '⏳ Espera...'}
            {showSignal && '🚀 ¡AHORA!'}
            {reactionTime !== null && (
              <div>
                {reactionTime === -1 ? '❌ Muy temprano' : `⚡ ${reactionTime}ms`}
              </div>
            )}
            {!waiting && !showSignal && reactionTime === null && '👆 Haz clic'}
          </div>

          <div style={{ marginBottom: '30px' }}>
            {waiting && <p>Espera la señal verde...</p>}
            {showSignal && <p>¡HAZ CLIC AHORA!</p>}
            {reactionTime === -1 && <p>¡Demasiado temprano! Espera la señal verde.</p>}
            {reactionTime > 0 && (
              <div>
                <p>Tu tiempo de reacción: <strong>{reactionTime}ms</strong></p>
                <p>
                  {reactionTime < 200 ? '🚀 ¡Increíble!' : 
                   reactionTime < 300 ? '⚡ ¡Muy bueno!' :
                   reactionTime < 400 ? '👍 Bueno' : '🐌 Puedes mejorar'}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={styles.buttonSecondary}
              onClick={() => {
                setShowSignal(false)
                setReactionTime(null)
                startRound()
              }}
            >
              🔄 Intentar de nuevo
            </button>
            
            {reactionTime > 0 && (
              <button
                style={styles.button}
                onClick={() => {
                  // Enviar tiempo de reacción al servidor
                  socket.emit('game-answer', {
                    type: 'reflex',
                    reactionTime: reactionTime
                  })
                  
                  setCurrentGame(null)
                  setGameState('waiting')
                  setCurrentPage('lobby')
                }}
              >
                ✅ Obtener Puntos
              </button>
            )}
            
            <button
              style={{ ...styles.button, background: 'rgba(255, 255, 255, 0.2)' }}
              onClick={() => {
                setCurrentGame(null)
                setGameState('waiting')
                setCurrentPage('lobby')
              }}
            >
              ← Salir del Juego
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Juego de Memoria
  const MemoryGame = () => {
    const [sequence, setSequence] = useState([])
    const [userSequence, setUserSequence] = useState([])
    const [showingSequence, setShowingSequence] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [level, setLevel] = useState(1)

    const colors = ['🔴', '🔵', '🟢', '🟡']

    const generateSequence = () => {
      const newColor = colors[Math.floor(Math.random() * colors.length)]
      const newSequence = [...sequence, newColor]
      setSequence(newSequence)
      showSequence(newSequence)
    }

    const showSequence = (seq) => {
      setShowingSequence(true)
      setCurrentIndex(0)
      
      seq.forEach((color, index) => {
        setTimeout(() => {
          setCurrentIndex(index)
        }, index * 800)
      })
      
      setTimeout(() => {
        setShowingSequence(false)
        setCurrentIndex(-1)
      }, seq.length * 800)
    }

    const handleColorClick = (color) => {
      if (showingSequence) return
      
      const newUserSequence = [...userSequence, color]
      setUserSequence(newUserSequence)
      
      // Verificar si es correcto
      if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
        // Error
        alert('❌ ¡Secuencia incorrecta! Empezando de nuevo...')
        setSequence([])
        setUserSequence([])
        setLevel(1)
        setTimeout(generateSequence, 1000)
      } else if (newUserSequence.length === sequence.length) {
        // Secuencia completa correcta - enviar al servidor
        socket.emit('game-answer', {
          type: 'memory',
          level: level,
          correct: true
        })
        
        alert(`🎉 ¡Nivel ${level} completado!`)
        setLevel(level + 1)
        setUserSequence([])
        setTimeout(generateSequence, 1500)
      }
    }

    useEffect(() => {
      generateSequence()
    }, [])

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={styles.glass}>
          <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>🧩 Juego de Memoria</h1>
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Nivel: {level}</p>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>
              {showingSequence ? 'Memoriza la secuencia...' : 'Repite la secuencia'}
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '20px', 
            maxWidth: '400px', 
            margin: '0 auto 30px' 
          }}>
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorClick(color)}
                style={{
                  width: '150px',
                  height: '150px',
                  fontSize: '4rem',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: showingSequence && currentIndex === sequence.indexOf(color) && sequence[currentIndex] === color
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(255, 255, 255, 0.2)',
                  transform: showingSequence && currentIndex === sequence.indexOf(color) && sequence[currentIndex] === color
                    ? 'scale(1.1)'
                    : 'scale(1)'
                }}
              >
                {color}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p>Secuencia actual: {sequence.join(' ')}</p>
            <p>Tu progreso: {userSequence.join(' ')}</p>
          </div>

          <button
            style={{ ...styles.button, background: 'rgba(255, 255, 255, 0.2)' }}
            onClick={() => {
              setCurrentGame(null)
              setGameState('waiting')
              setCurrentPage('lobby')
            }}
          >
            ← Salir del Juego
          </button>
        </div>
      </div>
    )
  }

  // Página de TV Ranking (sin cambios)
  const TVRankingPage = () => (
    <div style={{ 
      ...styles.container, 
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          🏆 RANKING PARTY GAMES 🏆
        </h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
          🎉 Ranking en tiempo real 🎉
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {players.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '2rem', opacity: 0.7 }}>
              No hay jugadores aún
            </p>
            <p style={{ fontSize: '1.5rem', opacity: 0.5 }}>
              Los jugadores aparecerán cuando se unan a la fiesta
            </p>
          </div>
        ) : (
          players.sort((a, b) => b.score - a.score).map((player, index) => (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '25px',
              marginBottom: '20px',
              borderRadius: '15px',
              background: index < 3 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: index < 3 ? '2px solid rgba(255, 255, 255, 0.3)' : 'none',
              fontSize: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
              <span style={{ fontSize: '3rem' }}>
                {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '2rem' }}>{player.name}</div>
                <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>{player.gamesPlayed} juegos jugados</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{player.score}</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>puntos</div>
            </div>
          </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          style={{ ...styles.button, fontSize: '1.2rem', padding: '20px 40px' }}
          onClick={() => setCurrentPage('lobby')}
        >
          ← Volver al Lobby
        </button>
      </div>
    </div>
  )

  // Renderizar la página actual
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'lobby':
        return <LobbyPage />
      case 'game':
        return <GamePage />
      case 'tv-ranking':
        return <TVRankingPage />
      default:
        return <HomePage />
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
          
          input::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
      <DebugPanel />
      {renderCurrentPage()}
    </>
  )
}

export default App 