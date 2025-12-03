import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Query,
  Req,
  Param,
  ParseIntPipe,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OperatorService } from '@app/modules/operator/operator.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AdminOperatorFullDto } from './dto/admin-operator-full.dto';
import { UpdateOperatorStatusDto } from './dto/update-operator-status.dto';
import { Request } from 'express';
import { OperatorStatus } from '@app/types/operator-status';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/operators')
export class AdminOperatorsController {
  constructor(private readonly operatorService: OperatorService) {}

  // ================= GET ALL WITH FILTERS =================
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OperatorStatus,
    description: 'pending | approved | rejected',
  })
  @ApiOperation({ summary: 'Отримати всіх операторів з фільтром і пагінацією' })
  @ApiResponse({
    status: 200,
    description: 'Список операторів',
    type: [AdminOperatorFullDto],
  })
  async getOperators(
    @Req() req: Request & { user: { role: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: OperatorStatus,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    const limitNumber = limit ? Number(limit) : undefined;
    const offsetNumber = offset ? Number(offset) : undefined;

    return await this.operatorService.getAllOperators(
      limitNumber,
      offsetNumber,
      status,
    );
  }

  // ================= GET ONE =================
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Отримати одного оператора' })
  @ApiResponse({
    status: 200,
    description: 'Детальна інформація про оператора',
    type: AdminOperatorFullDto,
  })
  async getOperatorById(
    @Req() req: Request & { user: { role: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    return await this.operatorService.getOperatorById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Оновити статус оператора' })
  @ApiResponse({
    status: 200,
    description: 'Статус оператора оновлено',
    type: AdminOperatorFullDto,
  })
  async updateStatus(
    @Req() req: Request & { user: { role: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOperatorStatusDto,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    return await this.operatorService.updateOperatorStatus(
      id,
      dto.status,
      dto.rejectionReason,
    );
  }
}
