import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const handleJoinParty = () => {
    if (name.trim()) {
      navigate('/lobby')
    } else {
      alert('Por favor ingresa tu nombre')
    }
  }

  const handleAdmin = () => {
    navigate('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-effect animate-fade-in" style={{
        maxWidth: '28rem',
        width: '100%',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div className="animate-pulse" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: 'white'
          }}>
            🎮 Party Games
          </h1>
        </div>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          opacity: '0.9',
          color: 'white'
        }}>
          ¡Únete a la diversión con tus amigos!
        </p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingresa tu nombre"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.125rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              outline: 'none',
              marginBottom: '1rem'
            }}
            maxLength={20}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleJoinParty}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1.125rem',
              fontWeight: '700',
              marginBottom: '1rem'
            }}
          >
            🎉 Unirse a la fiesta
          </button>
          
          <button
            onClick={handleAdmin}
            className="btn-secondary"
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1.125rem',
              fontWeight: '700'
            }}
          >
            👑 Soy Admin
          </button>
        </div>
        
        <div style={{
          marginTop: '2rem',
          fontSize: '0.875rem',
          opacity: '0.8',
          color: 'white'
        }}>
          <p>🎯 Mini-juegos • 🏆 Ranking en tiempo real • 📺 Vista para TV</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Sin registro necesario, solo diversión instantánea
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home 