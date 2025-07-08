import React, { createContext, useContext } from 'react'

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame debe ser usado dentro de un GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const value = {
    isRegistered: false,
    isLoading: false,
    error: null,
    registerPlayer: () => {},
    clearError: () => {}
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
} 