import { JWTPayload } from './jwt.payload';

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}
