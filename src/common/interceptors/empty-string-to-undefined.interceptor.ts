import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class EmptyStringToUndefinedInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.body) {
      const body = request.body as Record<string, string | undefined>;
      for (const key in body) {
        if (body[key] === '') {
          body[key] = undefined;
        }
      }
    }
    return next.handle();
  }
}
