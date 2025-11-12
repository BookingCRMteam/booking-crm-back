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
    const allowedOrigins = allowedOriginsStr?.trim()
      ? allowedOriginsStr.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000'];
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
