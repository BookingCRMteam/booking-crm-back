import {
  Controller,
  Get,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { OperatorService } from '@app/modules/operator/operator.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AdminOperatorListDto } from './dto/admin-operator-list.dto';
import { Request } from 'express';

@ApiTags('Admin')
@Controller('admin/operators')
export class AdminOperatorsController {
  constructor(private readonly operatorService: OperatorService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiOperation({ summary: 'Список операторів зі статусом pending' })
  @ApiResponse({
    status: 200,
    description: 'Список операторів успішно отримано',
    type: [AdminOperatorListDto],
  })
  async getPendingOperators(
    @Req() req: Request & { user: { role: string } },
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<AdminOperatorListDto[]> {
    // 🔒 Ручна перевірка ролі адміністратора
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    const operators = await this.operatorService.getOperatorsForVerification(
      limit,
      offset,
    );

    return operators.map((op) => ({
      firstName: op.firstName,
      lastName: op.lastName,
      email: op.email,
      status: op.status,
    }));
  }
}
