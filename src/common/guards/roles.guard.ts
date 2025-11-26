import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

interface UserWithRole {
  role: string;
  [key: string]: any;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly requiredRole: string) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: UserWithRole }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    if (user.role !== this.requiredRole) {
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}
