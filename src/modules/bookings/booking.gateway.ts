import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient, SigningKey } from 'jwks-rsa';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { BookingsService } from './bookings.service';
import { UserService } from '../user/user.service';
import { JWTPayload } from '@app/types/jwt.payload';
import { UserModel } from '../user/user.schema';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this for production security
  },
  namespace: 'bookings',
})
export class BookingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BookingGateway.name);

  private readonly client: JwksClient;

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly userService: UserService,
  ) {
    const issuerEnv = process.env.ISSUER;
    if (!issuerEnv) {
      throw new Error('ISSUER env variable is required for BookingGateway');
    }
    if (!process.env.AUDIENCE) {
      throw new Error('AUDIENCE env variable is required for BookingGateway');
    }

    const issuer = issuerEnv.endsWith('/') ? issuerEnv : `${issuerEnv}/`;

    this.client = new JwksClient({
      jwksUri: `${issuer}.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connecting: ${client.id}`);
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('Invalid token structure');
      }

      const key = await this.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      const payload = jwt.verify(token, publicKey, {
        audience: process.env.AUDIENCE,
        issuer: process.env.ISSUER,
        algorithms: ['RS256'],
      });

      (client.data as { user: any }).user = payload;
      this.logger.log(
        `Client connected: ${client.id}, User: ${JSON.stringify(payload)}`,
      );
    } catch (err) {
      this.logger.error(
        `Connection rejected for client ${client.id}: ${(err as Error).message}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeBooking')
  async handleSubscribeBooking(
    @MessageBody() data: { bookingId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Fetch the booking to verify it exists
      const booking = await this.bookingsService.findOne(data.bookingId);
      this.logger.log(
        `Booking ${data.bookingId} found with userId: ${booking.userId}`,
      );

      // Extract authenticated user from client.data.user
      const jwtPayload = (client.data as { user: JWTPayload }).user;
      if (!jwtPayload || !jwtPayload.sub) {
        this.logger.warn(
          `Client ${client.id} attempted to subscribe without authentication`,
        );
        return {
          ok: false,
          error: 'Unauthorized: Authentication required',
        };
      }

      // Get the user from the database using the JWT sub
      let user: UserModel;
      try {
        user = await this.userService.createOrGetUser(jwtPayload);
        this.logger.log(
          `User resolved: id=${user.id}, sub=${user.sub}, role=${user.role}`,
        );
      } catch (userError) {
        this.logger.error(
          `Failed to resolve user from JWT: ${(userError as Error).message}`,
        );
        this.logger.error(`JWT payload: ${JSON.stringify(jwtPayload)}`);
        return {
          ok: false,
          error: 'Failed to authenticate user',
        };
      }

      // Verify authorization: user owns the booking OR has operator/admin role
      const isOwner = booking.userId === user.id;
      const isOperatorOrAdmin =
        user.role === 'operator' || user.role === 'admin';

      if (!isOwner && !isOperatorOrAdmin) {
        this.logger.warn(
          `Client ${client.id} (user ${user.id}) attempted to subscribe to booking ${data.bookingId} (owner: ${booking.userId}) without authorization`,
        );
        return {
          ok: false,
          error: 'Unauthorized: You do not have access to this booking',
        };
      }

      // Authorization passed, join the room
      const roomName = `booking_${data.bookingId}`;
      await client.join(roomName);
      this.logger.log(
        `Client ${client.id} (user ${user.id}) joined room ${roomName}`,
      );
      return { ok: true, message: `Subscribed to booking ${data.bookingId}` };
    } catch (error) {
      this.logger.error(
        `Error in handleSubscribeBooking: ${(error as Error).message}`,
      );
      this.logger.error(`Error stack: ${(error as Error).stack}`);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe',
      };
    }
  }

  @SubscribeMessage('unsubscribeBooking')
  async handleUnsubscribeBooking(
    @MessageBody() data: { bookingId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Fetch the booking to verify it exists
      const booking = await this.bookingsService.findOne(data.bookingId);

      // Extract authenticated user from client.data.user
      const jwtPayload = (client.data as { user: JWTPayload }).user;
      if (!jwtPayload || !jwtPayload.sub) {
        this.logger.warn(
          `Client ${client.id} attempted to unsubscribe without authentication`,
        );
        return {
          ok: false,
          error: 'Unauthorized: Authentication required',
        };
      }

      // Get the user from the database using the JWT sub
      let user: UserModel;
      try {
        user = await this.userService.createOrGetUser(jwtPayload);
      } catch (userError) {
        this.logger.error(
          `Failed to resolve user from JWT: ${(userError as Error).message}`,
        );
        return {
          ok: false,
          error: 'Failed to authenticate user',
        };
      }

      // Verify authorization: user owns the booking OR has operator/admin role
      const isOwner = booking.userId === user.id;
      const isOperatorOrAdmin =
        user.role === 'operator' || user.role === 'admin';

      if (!isOwner && !isOperatorOrAdmin) {
        this.logger.warn(
          `Client ${client.id} (user ${user.id}) attempted to unsubscribe from booking ${data.bookingId} without authorization`,
        );
        return {
          ok: false,
          error: 'Unauthorized: You do not have access to this booking',
        };
      }

      // Authorization passed, leave the room
      const roomName = `booking_${data.bookingId}`;
      await client.leave(roomName);
      this.logger.log(
        `Client ${client.id} (user ${user.id}) left room ${roomName}`,
      );
      return {
        ok: true,
        message: `Unsubscribed from booking ${data.bookingId}`,
      };
    } catch (error) {
      this.logger.error(
        `Error in handleUnsubscribeBooking: ${(error as Error).message}`,
      );
      this.logger.error(`Error stack: ${(error as Error).stack}`);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe',
      };
    }
  }

  notifyBookingStatusChange(bookingId: number, status: string, userId: string) {
    const roomName = `booking_${bookingId}`;
    this.server
      .to(roomName)
      .emit('bookingStatusChange', { bookingId, status, userId });
    this.logger.log(
      `Emitted bookingStatusChange for booking ${bookingId} to status ${status} in room ${roomName}`,
    );
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }
    const authToken: unknown = client.handshake.auth?.token;
    if (typeof authToken === 'string') {
      return authToken;
    }
    return undefined;
  }

  private getSigningKey(kid: string): Promise<SigningKey> {
    return new Promise((resolve, reject) => {
      this.client.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key);
        }
      });
    });
  }
}
