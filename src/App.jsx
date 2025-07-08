import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { GameProvider } from './context/GameContext'
import Home from './pages/Home'
import Game from './pages/Game'
import Admin from './pages/Admin'
import TVRanking from './pages/TVRanking'
import Lobby from './pages/Lobby'

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby" element={<Lobby />} />
              <Route path="/game" element={<Game />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/tv-ranking" element={<TVRanking />} />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </SocketProvider>
  )
}

export default App 