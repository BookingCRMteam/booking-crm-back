/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { JWTPayload } from '@app/types/jwt.payload';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.ISSUER + '.well-known/jwks.json',
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUDIENCE,
      issuer: process.env.ISSUER,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JWTPayload): Promise<User> {
    try {
      return await this.userService.createOrGetUser(payload);
    } catch {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
