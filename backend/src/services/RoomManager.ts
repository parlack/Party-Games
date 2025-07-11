import { Room, Player, GameSettings } from '../types/game';

class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // playerId -> roomId
  private roomCodes: Map<string, string> = new Map(); // roomCode -> roomId

  /**
   * Crea una nueva sala
   */
  createRoom(settings: GameSettings): Room {
    const roomId = this.generateId();
    const roomCode = this.generateRoomCode();
    
    // Crear el jugador host
    const hostPlayer: Player = {
      id: this.generateId(),
      name: settings.hostName,
      isHost: true,
      isSpectator: false,
      joinedAt: new Date(),
      socketId: '', // Se asignará cuando se conecte
      isOnline: false
    };

    const room: Room = {
      id: roomId,
      name: settings.name,
      code: roomCode,
      maxPlayers: settings.maxPlayers,
      currentPlayers: 1,
      minigameCount: settings.minigameCount,
      isRandomGames: settings.isRandomGames,
      isActive: false,
      players: [hostPlayer],
      host: hostPlayer,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(roomId, room);
    this.roomCodes.set(roomCode, roomId);
    this.playerRooms.set(hostPlayer.id, roomId);

    return room;
  }

  /**
   * Obtiene una sala por su código
   */
  getRoomByCode(roomCode: string): Room | null {
    const roomId = this.roomCodes.get(roomCode);
    if (!roomId) return null;
    
    return this.rooms.get(roomId) || null;
  }

  /**
   * Obtiene una sala por su ID
   */
  getRoomById(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Obtiene todas las salas
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Obtiene salas activas (con al menos un jugador online)
   */
  getActiveRooms(): Room[] {
    return this.getAllRooms().filter(room => 
      room.players.some(player => player.isOnline)
    );
  }

  /**
   * Añade un jugador a una sala
   */
  addPlayerToRoom(roomCode: string, playerName: string, socketId: string, isSpectator: boolean = false): { room: Room; player: Player } | null {
    const room = this.getRoomByCode(roomCode);
    if (!room) return null;

    // Verificar si ya existe un host offline con el mismo nombre (caso de creador de sala)
    const existingHost = room.players.find(p => 
      p.isHost && 
      p.name === playerName && 
      !p.isOnline && 
      !p.socketId
    );

    if (existingHost) {
      // Actualizar el host existente con el socketId
      existingHost.socketId = socketId;
      existingHost.isOnline = true;
      existingHost.joinedAt = new Date();
      room.lastActivity = new Date();

      this.playerRooms.set(existingHost.id, room.id);

      console.log(`🔄 Host ${playerName} se conectó a su sala ${roomCode}`);
      return { room, player: existingHost };
    }

    // Verificar si la sala está llena
    if (room.currentPlayers >= room.maxPlayers) {
      return null;
    }

    const player: Player = {
      id: this.generateId(),
      name: playerName,
      isHost: false,
      isSpectator,
      joinedAt: new Date(),
      socketId,
      isOnline: true
    };

    room.players.push(player);
    room.currentPlayers++;
    room.lastActivity = new Date();

    this.playerRooms.set(player.id, room.id);

    return { room, player };
  }

  /**
   * Remueve un jugador de una sala
   */
  removePlayerFromRoom(playerId: string): { room: Room | null; wasHost: boolean } {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return { room: null, wasHost: false };

    const room = this.rooms.get(roomId);
    if (!room) return { room: null, wasHost: false };

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return { room: null, wasHost: false };

    const player = room.players[playerIndex];
    const wasHost = player.isHost;

    room.players.splice(playerIndex, 1);
    room.currentPlayers--;
    room.lastActivity = new Date();

    this.playerRooms.delete(playerId);

    // Si el host se va y hay otros jugadores, asignar nuevo host
    if (wasHost && room.players.length > 0) {
      const newHost = room.players[0];
      newHost.isHost = true;
      room.host = newHost;
    }

    // Si no quedan jugadores, eliminar la sala
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      this.roomCodes.delete(room.code);
      return { room: null, wasHost };
    }

    return { room, wasHost };
  }

  /**
   * Actualiza el socketId de un jugador
   */
  updatePlayerSocket(playerId: string, socketId: string): void {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.socketId = socketId;
      player.isOnline = true;
      room.lastActivity = new Date();
    }
  }

  /**
   * Marca un jugador como desconectado
   */
  setPlayerOffline(socketId: string): { room: Room | null; player: Player | null } {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.isOnline = false;
        room.lastActivity = new Date();
        return { room, player };
      }
    }
    return { room: null, player: null };
  }

  /**
   * Obtiene un jugador por su socketId
   */
  getPlayerBySocketId(socketId: string): { room: Room; player: Player } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        return { room, player };
      }
    }
    return null;
  }

  /**
   * Inicia un juego en una sala
   */
  startGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.isActive = true;
    room.lastActivity = new Date();
    return true;
  }

  /**
   * Limpia salas inactivas (sin jugadores online por más de 1 hora)
   */
  cleanInactiveRooms(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [roomId, room] of this.rooms.entries()) {
      const hasOnlinePlayers = room.players.some(p => p.isOnline);
      
      if (!hasOnlinePlayers && room.lastActivity < oneHourAgo) {
        // Limpiar referencias
        this.roomCodes.delete(room.code);
        for (const player of room.players) {
          this.playerRooms.delete(player.id);
        }
        this.rooms.delete(roomId);
      }
    }
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Genera un código de sala único
   */
  private generateRoomCode(): string {
    let code: string;
    do {
      code = Math.random().toString(36).substr(2, 6).toUpperCase();
    } while (this.roomCodes.has(code));
    
    return code;
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getStats() {
    const totalRooms = this.rooms.size;
    const activeRooms = this.getActiveRooms().length;
    const totalPlayers = Array.from(this.rooms.values()).reduce((sum, room) => sum + room.players.length, 0);
    const onlinePlayers = Array.from(this.rooms.values()).reduce((sum, room) => 
      sum + room.players.filter(p => p.isOnline).length, 0
    );

    return {
      totalRooms,
      activeRooms,
      totalPlayers,
      onlinePlayers
    };
  }
}

export default RoomManager; 