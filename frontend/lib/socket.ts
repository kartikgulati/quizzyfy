import { io, Socket } from 'socket.io-client';
import { GameEvents } from '@/types/game';

class SocketManager {
  private socket: Socket | null = null;
  private url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<K extends keyof GameEvents>(event: K, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on<K extends keyof GameEvents>(event: K, callback: (data: GameEvents[K]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off<K extends keyof GameEvents>(event: K, callback?: (data: GameEvents[K]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketManager = new SocketManager();