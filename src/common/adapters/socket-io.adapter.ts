import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    private app: INestApplication,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const allowedOriginsStr = this.configService.get<string>('ALLOWED_ORIGINS');
    let allowedOrigins: string[];
    if (!allowedOriginsStr?.trim()) {
      allowedOrigins = ['http://localhost:3000'];
      console.warn(
        `ALLOWED_ORIGINS not configured, falling back to ${allowedOrigins.join(', ')}. ` +
          'This may cause CORS errors in production.',
      );
    } else {
      allowedOrigins = allowedOriginsStr
        .split(',')
        .map((origin) => origin.trim());
    }
    const corsOptions = {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    };

    const server = super.createIOServer(port, {
      ...options,
      cors: corsOptions,
    }) as Server;
    return server;
  }
}
