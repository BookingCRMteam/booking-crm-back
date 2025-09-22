import { Request } from 'express';
import { User } from '@app/modules/user/user.schema';
import { JWTPayload } from '@app/types/jwt.payload';

export interface AuthenticatedRequest extends Request {
  user: User;
  jwtPayload?: JWTPayload;
}
