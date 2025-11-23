import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class NotificationsService {
  public server: Server | null = null;

  sendBookingStatusUpdate(bookingId: number, status: string) {
    if (this.server) {
      if ('emit' in this.server) {
        this.server.emit('bookingStatusUpdate', { bookingId, status });
      } else {
        throw new Error('Server is not initialized');
      }
    }
  }
}
