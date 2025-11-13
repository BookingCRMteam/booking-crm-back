import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SocketWithUser } from '@app/types/socket-with-user';
import { JwtPayload } from '@app/types/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<SocketWithUser>();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data = { ...(client.data || {}), user: payload };
    } catch {
      throw new WsException('Unauthorized');
    }

    return true;
  }

  private extractTokenFromHandshake(
    client: SocketWithUser,
  ): string | undefined {
    let token: string | undefined =
      (client.handshake.auth.token as string | undefined) ||
      client.handshake.headers['authorization'];

    if (token && token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    return token;
  }
}
