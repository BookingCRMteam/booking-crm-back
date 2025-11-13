import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, JwtFromRequestFunction } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { JWTPayload } from '@app/types/jwt.payload';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    const jwtExtractor: JwtFromRequestFunction = (req) =>
      ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.ISSUER + '.well-known/jwks.json',
      }),
      jwtFromRequest: jwtExtractor,
      audience: process.env.AUDIENCE,
      issuer: process.env.ISSUER,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JWTPayload) {
    try {
      const user = await this.userService.createOrGetUser(payload);
      return { ...user, jwtPayload: payload };
    } catch {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
