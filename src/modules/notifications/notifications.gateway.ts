import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { Server } from 'socket.io';
import { SubscribeBookingDto } from './dto/subscribe-booking.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { BookingsService } from '@app/modules/bookings/bookings.service';
import { SocketWithUser } from '@app/types/socket-with-user';

@WebSocketGateway()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly bookingsService: BookingsService) {}

  // map socketId -> set of bookingIds the client subscribed to
  private socketBookingMap = new Map<string, Set<number>>();

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  /**
   * Client requests to subscribe to updates for a specific booking.
   * Payload: { bookingId: number }
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('subscribeBooking')
  async handleSubscribeBooking(
    @MessageBody() payload: SubscribeBookingDto,
    @ConnectedSocket() socket: SocketWithUser,
  ) {
    const bookingId = payload.bookingId;
    const userId = socket.data.user.sub;

    const booking = await this.bookingsService.findOne(bookingId);

    if (!booking || booking.userId !== parseInt(userId, 10)) {
      throw new WsException('Unauthorized');
    }

    const roomName = `booking-${bookingId}`;
    await socket.join(roomName);

    const sid = socket.id;
    const set = this.socketBookingMap.get(sid) ?? new Set<number>();
    set.add(bookingId);
    this.socketBookingMap.set(sid, set);

    return { ok: true };
  }

  /**
   * Client unsubscribes from booking updates.
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('unsubscribeBooking')
  async handleUnsubscribeBooking(
    @MessageBody() payload: SubscribeBookingDto,
    @ConnectedSocket() socket: SocketWithUser,
  ) {
    const bookingId = payload.bookingId;
    const userId = socket.data.user.sub;

    const booking = await this.bookingsService.findOne(bookingId);
    if (!booking || booking.userId !== parseInt(userId, 10)) {
      throw new WsException('Unauthorized');
    }
    const roomName = `booking-${bookingId}`;
    // intentionally not awaiting leave promise
    await socket.leave(roomName);

    const sid = socket.id;
    const set = this.socketBookingMap.get(sid);
    if (set) {
      set.delete(bookingId);
      if (set.size === 0) this.socketBookingMap.delete(sid);
      else this.socketBookingMap.set(sid, set);
    }

    return { ok: true };
  }

  /**
   * Emit payment status updates only to clients subscribed to the booking room.
   */
  sendPaymentStatusUpdate(bookingId: number, status: string) {
    if (!this.server) return;

    const roomName = `booking-${bookingId}`;
    this.server.to(roomName).emit('paymentStatus', { bookingId, status });
  }

  handleConnection() {
    // noop - authentication is handled by JwtAuthGuard
  }

  handleDisconnect(socket: SocketWithUser) {
    const sid = socket.id;
    const set = this.socketBookingMap.get(sid);
    if (set) {
      for (const bookingId of set) {
        const roomName = `booking-${bookingId}`;
        // intentionally not awaiting leave promise
        void socket.leave(roomName);
      }
      this.socketBookingMap.delete(sid);
    }
  }
}
