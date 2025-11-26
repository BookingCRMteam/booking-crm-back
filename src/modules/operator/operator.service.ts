import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as operatorSchema from '@app/modules/operator/operator.schema';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UserService } from '../user/user.service';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { eq, sql } from 'drizzle-orm';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { OperatorStatus } from '@app/types/operator-status';
import * as schema from '@app/db/schema/schema';
import { operators } from '@app/modules/operator/operator.schema';

type OperatorSelect = typeof operators.$inferSelect;
@Injectable()
export class OperatorService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private db: NodePgDatabase<typeof schema>,
    private userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async addOperator(dto: CreateOperatorDto, req: AuthenticatedRequest) {
    if (!req.user.email) {
      throw new BadRequestException(
        'Email is required to register as operator',
      );
    }
    const existingOperator = await this.db
      .select()
      .from(operatorSchema.operators)
      .where(eq(operatorSchema.operators.userId, req.user.id));
    if (existingOperator.length > 0) {
      throw new BadRequestException('User is already registered as operator');
    }
    const newOperator = await this.db
      .insert(operatorSchema.operators)
      .values({
        companyName: dto.companyName || 'Приватна особа',
        description: dto.description || 'Приватна особа оператор турів',
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        website: dto.website,
        userId: req.user.id,
        email: req.user.email,
      })
      .returning();
    await this.userService.userToOperator(req.user.id, newOperator[0].id);
    return newOperator[0];
  }

  async updateOperator(
    dto: UpdateOperatorDto,
    req: AuthenticatedRequest,
    file?: Buffer,
  ) {
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
    const operator = await this.db.query.operators.findFirst({
      where: eq(operatorSchema.operators.id, req.user.operatorId),
    });

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    if (!operator.email && req.user.email) {
      updateData.email = req.user.email;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
    }

    const updatedOperator = await this.db
      .update(operatorSchema.operators)
      .set(updateData)
      .where(eq(operatorSchema.operators.id, req.user.operatorId))
      .returning();
    return updatedOperator[0];
  }

  async getOperatorById(id: number) {
    const operator = await this.db
      .select()
      .from(operatorSchema.operators)
      .where(eq(operatorSchema.operators.id, id));
    if (!operator[0])
      throw new NotFoundException(`Operator with ${id} not found`);
    return operator[0];
  }

  async getMyOperator(req: AuthenticatedRequest) {
    const operator = await this.db
      .select()
      .from(operatorSchema.operators)
      .where(eq(operatorSchema.operators.userId, req.user.id));
    if (!operator[0])
      throw new NotFoundException('You are not an operator yet.');
    return operator[0];
  }

  async getAllOperators(
    limit?: number,
    offset?: number,
    status?: OperatorStatus,
  ) {
    return await this.db
      .select()
      .from(operatorSchema.operators)
      .where(status ? eq(operatorSchema.operators.status, status) : undefined)
      .limit(limit)
      .offset(offset);
  }
  async rejectOperator(id: number, rejectionReason: string) {
    const operator = await this.db
      .select()
      .from(operatorSchema.operators)
      .where(eq(operatorSchema.operators.id, id))
      .then((res) => res[0]);

    if (!operator) {
      throw new NotFoundException(`Operator with id ${id} not found`);
    }

    if (operator.status !== OperatorStatus.PENDING.toString()) {
      throw new BadRequestException('Operator must be pending to be rejected');
    }

    const updatedOperator = await this.db
      .update(operatorSchema.operators)
      .set({
        status: OperatorStatus.REJECTED,
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(operatorSchema.operators.id, id))
      .returning();

    return updatedOperator[0];
  }
  async getOperatorsForVerification(
    limit = 50,
    offset = 0,
  ): Promise<OperatorSelect[]> {
    return await this.db
      .select()
      .from(operators)
      .where(eq(operators.status, OperatorStatus.PENDING))
      .limit(limit)
      .offset(offset);
  }
  async deletePhoto(req: AuthenticatedRequest) {
    const operator = await this.db.query.operators.findFirst({
      where: eq(operatorSchema.operators.userId, req.user.id),
    });
    if (!operator) {
      throw new NotFoundException('Operator not found');
    }
    if (!operator.photo) {
      throw new BadRequestException('No photo to delete');
    }
    const updatedOperator = await this.db
      .update(operatorSchema.operators)
      .set({ photo: null, updatedAt: new Date() })
      .where(eq(operatorSchema.operators.userId, req.user.id))
      .returning();
    return updatedOperator[0];
  }
  async getPopularOperators(limit = 6) {
    const operators = await this.db
      .select({
        id: operatorSchema.operators.id,
        email: operatorSchema.operators.email,
        createdAt: operatorSchema.operators.createdAt,
        updatedAt: operatorSchema.operators.updatedAt,
        userId: operatorSchema.operators.userId,
        companyName: operatorSchema.operators.companyName,
        description: operatorSchema.operators.description,
        firstName: operatorSchema.operators.firstName,
        lastName: operatorSchema.operators.lastName,
        website: operatorSchema.operators.website,
        phone: operatorSchema.operators.phone,
        status: operatorSchema.operators.status,
        philosophy: operatorSchema.operators.philosophy,
        photo: operatorSchema.operators.photo,
        bookingsCount: sql<number>`COUNT(DISTINCT ${schema.bookings.id})`,
        toursCount: sql<number>`COUNT(DISTINCT ${schema.tours.id})`,
      })
      .from(operatorSchema.operators)
      .leftJoin(
        schema.tours,
        eq(schema.tours.operatorId, operatorSchema.operators.id),
      )
      .leftJoin(schema.bookings, eq(schema.bookings.tourId, schema.tours.id))
      .groupBy(operatorSchema.operators.id)
      .orderBy(sql`COUNT(DISTINCT ${schema.bookings.id}) DESC`)
      .limit(limit);

    return operators.map((op) => ({
      ...op,
      bookingsCount: Number(op.bookingsCount),
      toursCount: Number(op.toursCount),
    }));
  }
}
