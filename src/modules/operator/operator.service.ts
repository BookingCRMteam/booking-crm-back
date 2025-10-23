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
import { eq } from 'drizzle-orm';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { OperatorStatus } from '@app/types/operator-status';
import * as schema from '@app/db/schema/schema';
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
  async getPopularOperators(limit = 6): Promise<
    Array<{
      id: number;
      companyName: string;
      logo: string | null;
      bookingsCount: number;
      toursCount: number;
    }>
  > {
    const rawSql = `
    SELECT
      o.id,
      o.company_name AS "companyName",
      o.photo AS "logo",
      COUNT(b.id) AS "bookingsCount",
      COUNT(DISTINCT t.id) AS "toursCount"
    FROM operators o
    LEFT JOIN tours t ON t.operator_id = o.id
    LEFT JOIN bookings b ON b.tour_id = t.id
    GROUP BY o.id
    ORDER BY "bookingsCount" DESC
    LIMIT $1
  `;

    // Коректна типізація client
    type RawRow = {
      id: number;
      companyName: string;
      logo: string | null;
      bookingsCount: string;
      toursCount: string;
    };

    const client = (
      this.db as unknown as {
        client: {
          query: (sql: string, params: any[]) => Promise<{ rows: RawRow[] }>;
        };
      }
    ).client;

    const result = await client.query(rawSql, [limit]);

    // Типізуємо і приводимо до number
    return result.rows.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      logo: r.logo,
      bookingsCount: Number(r.bookingsCount),
      toursCount: Number(r.toursCount),
    }));
  }
}
