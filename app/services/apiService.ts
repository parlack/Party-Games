const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3002/api' 
  : `${window.location.origin}/api`;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateRoomRequest {
  settings: {
    name: string;
    hostName: string;
    maxPlayers: number;
    minigameCount: number;
    isRandomGames: boolean;
    selectedGames?: string[];
  };
}

export interface Room {
  id: string;
  name: string;
  code: string;
  maxPlayers: number;
  currentPlayers: number;
  minigameCount: number;
  isRandomGames: boolean;
  isActive: boolean;
  players: Player[];
  host: Player;
  createdAt: string;
  lastActivity: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isSpectator: boolean;
  avatar?: string;
  joinedAt: string;
  socketId: string;
  isOnline: boolean;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  async createRoom(settings: CreateRoomRequest['settings']): Promise<ApiResponse<Room>> {
    return this.makeRequest<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ settings }),
    });
  }

  async getRoomByCode(code: string): Promise<ApiResponse<Room>> {
    return this.makeRequest<Room>(`/rooms/${code.toUpperCase()}`);
  }

  async getActiveRooms(): Promise<ApiResponse<{ rooms: Room[]; total: number }>> {
    return this.makeRequest<{ rooms: Room[]; total: number }>('/rooms');
  }

  async checkRoomAvailability(code: string): Promise<ApiResponse<{
    exists: boolean;
    available: boolean;
    reason?: string;
    currentPlayers?: number;
    maxPlayers?: number;
  }>> {
    return this.makeRequest(`/rooms/${code.toUpperCase()}/available`);
  }

  async deleteRoom(code: string): Promise<ApiResponse> {
    return this.makeRequest(`/rooms/${code.toUpperCase()}`, {
      method: 'DELETE',
    });
  }

  async getStats(): Promise<ApiResponse<{
    totalRooms: number;
    activeRooms: number;
    totalPlayers: number;
    onlinePlayers: number;
  }>> {
    return this.makeRequest('/stats');
  }

  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    stats: any;
  }>> {
    try {
      const healthUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3002/health' 
        : `${window.location.origin}/health`;
      const response = await fetch(healthUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        error: 'Servidor no disponible',
      };
    }
  }
}

export const apiService = new ApiService(); 