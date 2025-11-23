import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwksClient, SigningKey } from 'jwks-rsa';

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

  constructor() {
    const issuer = process.env.ISSUER?.endsWith('/')
      ? process.env.ISSUER
      : `${process.env.ISSUER}/`;

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

  notifyBookingStatusChange(bookingId: number, status: string, userId: string) {
    // In a real-world scenario, you might want to emit to a specific user room
    // For now, we will emit to all connected clients or you can implement room logic
    // client.join(`user_${userId}`);

    // Emitting to all for demonstration, but ideally should be targeted
    // this.server.to(`user_${userId}`).emit('bookingStatusChange', { bookingId, status });

    this.server.emit('bookingStatusChange', { bookingId, status, userId });
    this.logger.log(
      `Emitted bookingStatusChange for booking ${bookingId} to status ${status}`,
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
