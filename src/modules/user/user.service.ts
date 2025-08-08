import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JWTPayload } from '@app/types/jwt.payload';
import * as userSchema from '@app/modules/user/user.schema';

@Injectable()
export class UserService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private db: NodePgDatabase<typeof userSchema>,
  ) {}
  async createOrGetUser(userJWT: JWTPayload) {
    const userInDb = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.sub, userJWT.sub),
    });
    if (!userInDb) {
      const newUser = await this.db
        .insert(userSchema.users)
        .values({ sub: userJWT.sub })
        .returning();
      return newUser[0];
    }
    return userInDb;
  }
}
