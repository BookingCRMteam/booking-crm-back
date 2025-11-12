import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { SocketWithUser } from '@app/types/socket-with-user';
import { JwtPayload } from '@app/types/jwt-payload.interface';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<SocketWithUser>();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      client.data = { ...client.data, user: payload };
    } catch {
      throw new WsException('Unauthorized');
    }

    return true;
  }

  private extractTokenFromHandshake(
    client: SocketWithUser,
  ): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
