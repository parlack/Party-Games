import React, { createContext, useContext } from 'react'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de un SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const value = {
    isConnected: true,
    connectionError: null
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
} 