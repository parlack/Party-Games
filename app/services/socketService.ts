import { io, Socket } from 'socket.io-client';
import type { Room, Player } from './apiService';

const SOCKET_URL = 'http://localhost:3002';

export interface JoinRoomRequest {
  roomCode: string;
  playerName: string;
  isSpectator?: boolean;
}

export interface SocketEvents {
  // Eventos del cliente al servidor
  'join-room': (data: JoinRoomRequest) => void;
  'leave-room': () => void;
  'start-game': () => void;
  'player-ready-status': () => void;
  'player-not-ready-status': () => void;
  'ping': () => void;

  // Eventos del servidor al cliente
  'room-joined': (room: Room, player: Player) => void;
  'room-left': () => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'room-updated': (room: Room) => void;
  'game-started': (room: Room) => void;
  'player-ready': (playerId: string) => void;
  'player-not-ready': (playerId: string) => void;
  'error': (message: string) => void;
  'room-not-found': () => void;
  'room-full': () => void;
  'pong': () => void;
}

type EventCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, EventCallback[]> = new Map();
  private isConnected = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Conectado al servidor WebSocket');
        this.isConnected = true;
        
        // Reestablecer listeners
        this.eventListeners.forEach((callbacks, event) => {
          callbacks.forEach(callback => {
            this.socket?.on(event, callback);
          });
        });
        
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Desconectado del servidor WebSocket');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
        reject(error);
      });

      // Auto-ping para mantener conexión
      setInterval(() => {
        if (this.isConnected) {
          this.emit('ping');
        }
      }, 30000);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    } else {
      console.warn(`⚠️ Intentando emitir evento ${event} sin conexión`);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    // Guardar el listener para reestablecer en reconexión
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    // Registrar en el socket si está conectado
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      // Remover listener específico
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
      this.socket?.off(event, callback);
    } else {
      // Remover todos los listeners del evento
      this.eventListeners.delete(event);
      this.socket?.off(event);
    }
  }

  // Métodos de conveniencia para eventos comunes
  joinRoom(data: JoinRoomRequest): void {
    this.emit('join-room', data);
  }

  leaveRoom(): void {
    this.emit('leave-room');
  }

  startGame(): void {
    this.emit('start-game');
  }

  markPlayerReady(): void {
    this.emit('player-ready-status');
  }

  markPlayerNotReady(): void {
    this.emit('player-not-ready-status');
  }

  // Getters
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService(); 