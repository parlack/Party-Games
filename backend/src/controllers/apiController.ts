import { Express, Request, Response } from 'express';
import RoomManager from '../services/RoomManager';
import { CreateRoomRequest, ApiResponse, RoomListResponse } from '../types/game';

export function setupRoutes(app: Express, roomManager: RoomManager) {
  
  // Crear una nueva sala
  app.post('/api/rooms', (req: Request, res: Response) => {
    try {
      const { settings } = req.body as CreateRoomRequest;
      
      // Validar datos requeridos
      if (!settings || !settings.name || !settings.hostName) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos: name, hostName'
        } as ApiResponse);
      }

      // Validar límites
      if (settings.maxPlayers < 2 || settings.maxPlayers > 20) {
        return res.status(400).json({
          success: false,
          error: 'maxPlayers debe estar entre 2 y 20'
        } as ApiResponse);
      }

      if (settings.minigameCount < 1 || settings.minigameCount > 20) {
        return res.status(400).json({
          success: false,
          error: 'minigameCount debe estar entre 1 y 20'
        } as ApiResponse);
      }

      // Crear la sala
      const room = roomManager.createRoom(settings);
      
      console.log(`🏠 Sala creada: ${room.name} (${room.code})`);
      
      res.status(201).json({
        success: true,
        data: room,
        message: 'Sala creada exitosamente'
      } as ApiResponse);
      
    } catch (error) {
      console.error('Error al crear sala:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse);
    }
  });

  // Obtener información de una sala por código
  app.get('/api/rooms/:code', (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Código de sala requerido'
        } as ApiResponse);
      }

      const room = roomManager.getRoomByCode(code.toUpperCase());
      
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Sala no encontrada'
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: room
      } as ApiResponse);
      
    } catch (error) {
      console.error('Error al obtener sala:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse);
    }
  });

  // Obtener lista de salas activas
  app.get('/api/rooms', (req: Request, res: Response) => {
    try {
      const activeRooms = roomManager.getActiveRooms();
      
      res.json({
        success: true,
        data: {
          rooms: activeRooms,
          total: activeRooms.length
        } as RoomListResponse
      } as ApiResponse<RoomListResponse>);
      
    } catch (error) {
      console.error('Error al obtener salas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse);
    }
  });

  // Eliminar una sala (solo para testing/admin)
  app.delete('/api/rooms/:code', (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Código de sala requerido'
        } as ApiResponse);
      }

      const room = roomManager.getRoomByCode(code.toUpperCase());
      
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Sala no encontrada'
        } as ApiResponse);
      }

      // Remover todos los jugadores de la sala
      const playerIds = room.players.map(p => p.id);
      playerIds.forEach(playerId => {
        roomManager.removePlayerFromRoom(playerId);
      });

      console.log(`🗑️ Sala eliminada: ${room.name} (${room.code})`);
      
      res.json({
        success: true,
        message: 'Sala eliminada exitosamente'
      } as ApiResponse);
      
    } catch (error) {
      console.error('Error al eliminar sala:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse);
    }
  });

  // Obtener estadísticas del sistema
  app.get('/api/stats', (req: Request, res: Response) => {
    try {
      const stats = roomManager.getStats();
      
      res.json({
        success: true,
        data: stats
      } as ApiResponse);
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse);
    }
  });

  // Verificar si una sala existe y está disponible
  app.get('/api/rooms/:code/available', (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Código de sala requerido'
        } as ApiResponse);
      }

      const room = roomManager.getRoomByCode(code.toUpperCase());
      
      if (!room) {
        return res.json({
          success: true,
          data: {
            exists: false,
            available: false,
            reason: 'Sala no encontrada'
          }
        } as ApiResponse);
      }

      const available = room.currentPlayers < room.maxPlayers;
      
      res.json({
        success: true,
        data: {
          exists: true,
          available,
          reason: available ? null : 'Sala llena',
          currentPlayers: room.currentPlayers,
          maxPlayers: room.maxPlayers
        }
      } as ApiResponse);
      
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse);
    }
  });

  // Ruta para testing - limpiar todas las salas
  app.post('/api/admin/cleanup', (req: Request, res: Response) => {
    try {
      roomManager.cleanInactiveRooms();
      
      res.json({
        success: true,
        message: 'Limpieza completada'
      } as ApiResponse);
      
    } catch (error) {
      console.error('Error en limpieza:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse);
    }
  });
} 