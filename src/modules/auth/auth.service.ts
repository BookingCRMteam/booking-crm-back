import { Injectable } from '@nestjs/common';
import { JWTPayload } from '@app/types/jwt.payload';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  async create(userJWT: JWTPayload) {
    return await this.userService.createOrGetUser(userJWT);
  }
}
