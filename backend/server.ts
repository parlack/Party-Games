import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { config } from './src/config/environment';
import RoomManager from './src/services/RoomManager';
import { setupSocketHandlers } from './src/controllers/socketController';
import { setupRoutes } from './src/controllers/apiController';

const app = express();
const server = http.createServer(app);

// Configurar CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Configurar Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.socketIoCorsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Instanciar el gestor de salas
const roomManager = new RoomManager();

// Configurar rutas de la API
setupRoutes(app, roomManager);

// Configurar manejadores de Socket.IO
setupSocketHandlers(io, roomManager);

// Middleware para manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Ruta de salud
app.get('/health', (req, res) => {
  const stats = roomManager.getStats();
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats
    }
  });
});

// Limpiar salas inactivas periódicamente
setInterval(() => {
  roomManager.cleanInactiveRooms();
  console.log('Limpieza de salas inactivas completada');
}, config.cleanupInterval);

// Iniciar servidor
server.listen(config.port, () => {
  console.log(`🚀 Servidor iniciado en puerto ${config.port}`);
  console.log(`🌐 CORS habilitado para: ${config.corsOrigin}`);
  console.log(`🔌 Socket.IO habilitado para: ${config.socketIoCorsOrigin}`);
  console.log(`🧹 Limpieza automática cada ${config.cleanupInterval / 1000} segundos`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

export default app; 