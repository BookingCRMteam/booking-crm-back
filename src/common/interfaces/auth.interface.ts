import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}
