import { Socket } from 'socket.io';
import { JwtPayload } from './jwt-payload.interface';

export interface SocketWithUser extends Socket {
  data: {
    user: JwtPayload;
  };
}
