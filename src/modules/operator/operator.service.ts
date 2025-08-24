import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as operatorSchema from '@app/modules/operator/operator.schema';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { JWTPayload } from '@app/types/jwt.payload';
import { UserService } from '../user/user.service';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { eq } from 'drizzle-orm/sql';

@Injectable()
export class OperatorService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private db: NodePgDatabase<typeof operatorSchema>,
    private userService: UserService,
  ) {}

  async addOperator(dto: CreateOperatorDto, userJWT: JWTPayload) {
    const user = await this.userService.createOrGetUser(userJWT);

    const newOperator = await this.db
      .insert(operatorSchema.operators)
      .values({
        companyName: dto.companyName || 'Приватна особа',
        description: dto.description || 'Приватна особа оператор турів',
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        website: dto.website,
        userId: user.id,
      })
      .returning();
    return newOperator[0];
  }

  async updateOperator(dto: UpdateOperatorDto, userJWT: JWTPayload) {
    const user = await this.userService.createOrGetUser(userJWT);
    const updatedOperator = await this.db
      .update(operatorSchema.operators)
      .set({
        companyName: dto.companyName,
        description: dto.description,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        website: dto.website,
      })
      .where(eq(operatorSchema.operators.id, user.id))
      .returning();
    return updatedOperator[0];
  }
}
