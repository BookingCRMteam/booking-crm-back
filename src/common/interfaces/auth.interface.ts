import { Request } from 'express';
import { User } from '@app/modules/user/user.schema';

export interface AuthenticatedUser extends User {
  _dummy?: never;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}
