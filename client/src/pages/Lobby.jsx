import React from 'react'
import { useNavigate } from 'react-router-dom'

const Lobby = () => {
  const navigate = useNavigate()

  // Datos de ejemplo para el ranking
  const mockRanking = [
    { id: 1, name: 'Carlos', score: 250, gamesPlayed: 5 },
    { id: 2, name: 'Ana', score: 200, gamesPlayed: 4 },
    { id: 3, name: 'Luis', score: 180, gamesPlayed: 3 },
    { id: 4, name: 'María', score: 150, gamesPlayed: 3 },
  ]

  const handlePlayGame = (gameType) => {
    navigate('/game')
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
          <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
            🎮 Lobby de Juegos
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: '0.9', color: 'white' }}>
            ¡Elige tu juego favorito!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* Ranking */}
          <div className="glass-effect animate-fade-in" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>
              🏆 Ranking de la Fiesta
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mockRanking.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem' }}>
                      {index === 0 && <span style={{ fontSize: '1.5rem' }}>👑</span>}
                      {index === 1 && <span style={{ fontSize: '1.5rem' }}>🥈</span>}
                      {index === 2 && <span style={{ fontSize: '1.5rem' }}>🥉</span>}
                      {index > 2 && <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white' }}>#{index + 1}</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.125rem', color: 'white' }}>{player.name}</div>
                      <div style={{ fontSize: '0.875rem', opacity: '0.7', color: 'white' }}>{player.gamesPlayed} juegos jugados</div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{player.score}</div>
                    <div style={{ fontSize: '0.875rem', opacity: '0.7', color: 'white' }}>puntos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini-juegos */}
          <div className="glass-effect animate-fade-in" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>🎯 Mini-juegos</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => handlePlayGame('quiz')}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>🧠 Quiz Rápido</div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>Preguntas y respuestas</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>100pts</div>
              </button>
              
              <button
                onClick={() => handlePlayGame('reflex')}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>⚡ Reflejos</div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>Velocidad de reacción</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>50pts</div>
              </button>
              
              <button
                onClick={() => handlePlayGame('memory')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>🧩 Memoria</div>
                  <div style={{ fontSize: '0.875rem', opacity: '0.8' }}>Secuencias de colores</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>75pts</div>
              </button>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="glass-effect animate-fade-in" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/tv-ranking')}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: '700'
                }}
              >
                📺 Ver Ranking en TV
              </button>
              
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: '700',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                🏠 Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lobby 