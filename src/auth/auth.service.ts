import { Inject, Injectable } from '@nestjs/common';
import { JWTPayload } from '@app/types/jwt.payload';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as userSchema from 'src/user/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private db: NodePgDatabase<typeof userSchema>,
  ) {}
  async create(userJWT: JWTPayload) {
    const userInDb = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.sub, userJWT.sub),
    });
    if (!userInDb) {
      const newUser = await this.db
        .insert(userSchema.users)
        .values({ sub: userJWT.sub })
        .returning();
      return newUser;
    }
    return userInDb;
  }
}
