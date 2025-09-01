import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '@app/modules/user/user.schema';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  create(user: User) {
    return user;
  }
}
