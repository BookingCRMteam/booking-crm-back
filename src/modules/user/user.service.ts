import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JWTPayload } from '@app/types/jwt.payload';
import * as userSchema from '@app/modules/user/user.schema';
import { mapToUserEntity } from '@app/types/user_mapper';
import { eq } from 'drizzle-orm';

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
      const userData = mapToUserEntity(userJWT);
      const newUser = await this.db
        .insert(userSchema.users)
        .values({
          sub: userJWT.sub,
          firstPersonName: userData.firstPersonName,
          firstPersonSurname: userData.firstPersonSurname,
          email: userJWT.email,
        })
        .returning();
      return newUser[0];
    }
    return userInDb;
  }

  async userToOperator(userId: number) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.db
      .update(userSchema.users)
      .set({ role: 'operator' })
      .where(eq(userSchema.users.id, userId));
  }
}
