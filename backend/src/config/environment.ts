export const config = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  socketIoCorsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173',
  cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '300000'), // 5 minutos
}; 