import React, { useState, useEffect } from 'react'

// Contraseña del host
const HOST_PASSWORD = "fiesta2025"

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
  
  // Estado de usuarios conectados (sincronizado entre ventanas)
  const [connectedUsers, setConnectedUsers] = useState(() => {
    const saved = localStorage.getItem('partyGames_connectedUsers')
    return saved ? JSON.parse(saved) : []
  })

  // Ranking de jugadores (sincronizado entre ventanas)
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('partyGames_players')
    return saved ? JSON.parse(saved) : []
  })

  // Función para actualizar usuarios conectados y sincronizar
  const updateConnectedUsers = (newUsers) => {
    setConnectedUsers(newUsers)
    localStorage.setItem('partyGames_connectedUsers', JSON.stringify(newUsers))
    // Disparar evento para sincronizar otras ventanas
    window.dispatchEvent(new CustomEvent('partyGames_usersUpdated', { detail: newUsers }))
  }

  // Función para actualizar ranking y sincronizar
  const updatePlayers = (newPlayers) => {
    setPlayers(newPlayers)
    localStorage.setItem('partyGames_players', JSON.stringify(newPlayers))
    // Disparar evento para sincronizar otras ventanas
    window.dispatchEvent(new CustomEvent('partyGames_playersUpdated', { detail: newPlayers }))
  }

  // Escuchar cambios de otras ventanas
  useEffect(() => {
    const handleUsersUpdate = (event) => {
      setConnectedUsers(event.detail)
    }
    
    const handlePlayersUpdate = (event) => {
      setPlayers(event.detail)
    }

    const handleStorageChange = (event) => {
      if (event.key === 'partyGames_connectedUsers') {
        const newUsers = event.newValue ? JSON.parse(event.newValue) : []
        setConnectedUsers(newUsers)
      } else if (event.key === 'partyGames_players') {
        const newPlayers = event.newValue ? JSON.parse(event.newValue) : []
        setPlayers(newPlayers)
      }
    }

    window.addEventListener('partyGames_usersUpdated', handleUsersUpdate)
    window.addEventListener('partyGames_playersUpdated', handlePlayersUpdate)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('partyGames_usersUpdated', handleUsersUpdate)
      window.removeEventListener('partyGames_playersUpdated', handlePlayersUpdate)
      window.removeEventListener('storage', handleStorageChange)
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

  // Función para iniciar juego (solo host)
  const startGame = (gameType) => {
    if (!isHost) {
      alert('Solo el host puede iniciar juegos')
      return
    }
    
    setCurrentGame(gameType)
    setGameState('playing')
    setCurrentPage('game')
    
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
              if (playerName.trim()) {
                // Agregar usuario a la lista
                const newUser = {
                  id: Date.now(),
                  name: playerName,
                  isHost: isHost,
                  connected: true
                }
                updateConnectedUsers([...connectedUsers, newUser])
                
                // Agregar al ranking si no existe
                const existingPlayer = players.find(p => p.name === playerName)
                if (!existingPlayer) {
                  const newPlayer = {
                    id: Date.now(),
                    name: playerName,
                    score: 0,
                    gamesPlayed: 0
                  }
                  updatePlayers([...players, newPlayer])
                }
                
                setCurrentPage('lobby')
              } else {
                alert('Por favor ingresa tu nombre')
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
              if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos? Esto eliminará todos los usuarios y puntuaciones.')) {
                localStorage.removeItem('partyGames_connectedUsers')
                localStorage.removeItem('partyGames_players')
                updateConnectedUsers([])
                updatePlayers([])
                setPlayerName('')
                setIsHost(false)
                alert('¡Datos limpiados! La aplicación está lista para una nueva fiesta.')
              }
            }}
          >
            🗑️ Limpiar Datos
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
        // Fin del juego - agregar puntos
        const correctAnswers = gameData.userAnswers?.filter(answer => answer.correct).length || 0
        const points = correctAnswers * 25 // 25 puntos por respuesta correcta
        
        const updatedPlayers = players.map(player => 
          player.name === playerName 
            ? { ...player, score: player.score + points, gamesPlayed: player.gamesPlayed + 1 }
            : player
        )
        updatePlayers(updatedPlayers)
        
        setGameState('finished')
        setCurrentPage('lobby')
        alert(`¡Quiz completado! 🎉\nRespuestas correctas: ${correctAnswers}\nPuntos ganados: ${points}`)
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
                  // Agregar puntos basados en el tiempo de reacción
                  let points = 0
                  if (reactionTime < 200) points = 100
                  else if (reactionTime < 300) points = 75
                  else if (reactionTime < 400) points = 50
                  else points = 25
                  
                  const updatedPlayers = players.map(player => 
                    player.name === playerName 
                      ? { ...player, score: player.score + points, gamesPlayed: player.gamesPlayed + 1 }
                      : player
                  )
                  updatePlayers(updatedPlayers)
                  
                  alert(`¡Puntos ganados: ${points}! 🎉`)
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
        // Secuencia completa correcta
        const points = level * 15 // 15 puntos por nivel
        
        const updatedPlayers = players.map(player => 
          player.name === playerName 
            ? { ...player, score: player.score + points, gamesPlayed: player.gamesPlayed + 1 }
            : player
        )
        updatePlayers(updatedPlayers)
        
        alert(`🎉 ¡Nivel ${level} completado!\nPuntos ganados: ${points}`)
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
      {renderCurrentPage()}
    </>
  )
}

export default App 