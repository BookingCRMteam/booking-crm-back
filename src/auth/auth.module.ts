import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
