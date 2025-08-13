import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as operatorSchema from '@app/modules/operator/operator.schema';
import { OperatorInfoDto } from './dto/operatorInfo.dto';
import { JWTPayload } from '@app/types/jwt.payload';
import { UserService } from '../user/user.service';

@Injectable()
export class OperatorService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private db: NodePgDatabase<typeof operatorSchema>,
    private userService: UserService,
  ) {}

  async addOperator(dto: OperatorInfoDto, userJWT: JWTPayload) {
    const user = await this.userService.createOrGetUser(userJWT);

    const newOperator = await this.db
      .insert(operatorSchema.operators)
      .values({
        companyName: dto.companyName,
        description: dto.description,
        contactPerson: dto.contactPerson,
        phone: dto.phone,
        website: dto.website,
        userId: user.id,
      })
      .returning();
    return newOperator[0];
  }
}
