import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  getSome() {
    return 'all';
  }

  @Post()
  createNewOrAuth() {
    return this.authService.createNewOrAuth();
  }
}
