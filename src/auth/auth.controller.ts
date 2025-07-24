import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JWTPayload } from '@app/types/jwt.payload';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest) {
    return this.authService.create(req.user);
  }
}

interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}
