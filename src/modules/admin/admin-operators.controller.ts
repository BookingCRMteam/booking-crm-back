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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OperatorService } from '@app/modules/operator/operator.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AdminOperatorFullDto } from './dto/admin-operator-full.dto';
import { UpdateOperatorStatusDto } from './dto/update-operator-status.dto';
import { Request } from 'express';
import { GetOperatorsQueryDto } from './dto/get-operators.query.dto';
@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/operators')
export class AdminOperatorsController {
  constructor(private readonly operatorService: OperatorService) {}

  // ================= GET ALL WITH FILTERS =================
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Отримати всіх операторів з фільтром і пагінацією' })
  @ApiResponse({
    status: 200,
    description: 'Список операторів',
    type: [AdminOperatorFullDto],
  })
  async getOperators(
    @Req() req: Request & { user: { role: string } },
    @Query() query: GetOperatorsQueryDto,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    const { limit, offset, status } = query;

    return await this.operatorService.getAllOperators(limit, offset, status);
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
