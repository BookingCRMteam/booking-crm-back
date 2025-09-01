import { Request } from 'express';
import { User } from '@app/modules/user/user.schema';

export interface AuthenticatedRequest extends Request {
  user: User;
}
