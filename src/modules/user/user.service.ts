import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JWTPayload } from '@app/types/jwt.payload';
import * as userSchema from '@app/modules/user/user.schema';
import { mapToUserEntity } from '@app/types/user_mapper';
import { eq } from 'drizzle-orm';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';

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

  async userToOperator(userId: number, operatorId: number) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.db
      .update(userSchema.users)
      .set({ role: 'operator', operatorId })
      .where(eq(userSchema.users.id, userId));
  }

  async getById(id: number) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllUsers(limit: number, offset: number) {
    const users = await this.db
      .select()
      .from(userSchema.users)
      .limit(limit)
      .offset(offset);
    return users;
  }
  async updateUser(id: number, userDTO: UpdateUserInfoDto) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updateData: Partial<typeof userSchema.users.$inferInsert> = {};
    if (userDTO.firstPersonName !== undefined)
      updateData.firstPersonName = userDTO.firstPersonName;
    if (userDTO.firstPersonSurname !== undefined)
      updateData.firstPersonSurname = userDTO.firstPersonSurname;
    if (userDTO.secondPersonName !== undefined)
      updateData.secondPersonName = userDTO.secondPersonName;
    if (userDTO.secondPersonSurname !== undefined)
      updateData.secondPersonSurname = userDTO.secondPersonSurname;
    if (userDTO.phone !== undefined) updateData.phone = userDTO.phone;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
    }

    const updatedUser = await this.db
      .update(userSchema.users)
      .set(updateData)
      .where(eq(userSchema.users.id, id))
      .returning();
    return updatedUser[0];
  }
}
