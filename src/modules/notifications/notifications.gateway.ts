import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SubscribeBookingDto } from './dto/subscribe-booking.dto';

@WebSocketGateway()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

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
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('subscribeBooking')
  handleSubscribeBooking(
    @MessageBody() payload: SubscribeBookingDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const bookingId = payload.bookingId;

    const roomName = `booking-${bookingId}`;
    // join the room for that booking; socket.join is safe to call without await
    // intentionally not awaiting join promise
    void socket.join(roomName);

    const sid = socket.id;
    const set = this.socketBookingMap.get(sid) ?? new Set<number>();
    set.add(bookingId);
    this.socketBookingMap.set(sid, set);

    return { ok: true };
  }

  /**
   * Client unsubscribes from booking updates.
   */
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('unsubscribeBooking')
  handleUnsubscribeBooking(
    @MessageBody() payload: SubscribeBookingDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const bookingId = payload.bookingId;

    const roomName = `booking-${bookingId}`;
    // intentionally not awaiting leave promise
    void socket.leave(roomName);

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

  handleConnection(_socket: Socket) {
    // noop - clients should explicitly subscribe to booking rooms
    // reference param to satisfy linter
    void _socket;
  }

  handleDisconnect(socket: Socket) {
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
