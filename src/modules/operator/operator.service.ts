import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as operatorSchema from '@app/modules/operator/operator.schema';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UserService } from '../user/user.service';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { eq } from 'drizzle-orm';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { User } from '@app/modules/user/user.schema';

@Injectable()
export class OperatorService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private db: NodePgDatabase<typeof operatorSchema>,
    private userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async addOperator(dto: CreateOperatorDto, user: User) {
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

  async updateOperator(dto: UpdateOperatorDto, user: User, file?: Buffer) {
    const updateData: Partial<typeof operatorSchema.operators.$inferInsert> =
      {};
    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.philosophy !== undefined) updateData.philosophy = dto.philosophy;
    if (file) {
      const photoUrl = (await this.cloudinaryService.uploadImage(file)).url;
      updateData.photo = photoUrl;
    }
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
    }

    const updatedOperator = await this.db
      .update(operatorSchema.operators)
      .set(updateData)
      .where(eq(operatorSchema.operators.id, user.id))
      .returning();
    return updatedOperator[0];
  }
}
