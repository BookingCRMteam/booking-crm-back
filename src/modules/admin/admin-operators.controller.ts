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
import { AdminOperatorListDto } from './dto/admin-operator-list.dto';
import { RejectOperatorDto } from './dto/reject-operator.dto';
import { Request } from 'express';
import { OperatorStatus } from '@app/types/operator-status';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/operators')
export class AdminOperatorsController {
  constructor(private readonly operatorService: OperatorService) {}

  // ================= GET PENDING OPERATORS =================
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<AdminOperatorListDto[]> {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    const limitNumber = limit ? Number(limit) : undefined;
    const offsetNumber = offset ? Number(offset) : undefined;

    const operators = await this.operatorService.getOperatorsForVerification(
      limitNumber,
      offsetNumber,
    );

    return operators.map((op) => {
      const dto: AdminOperatorListDto = {
        firstName: op.firstName,
        lastName: op.lastName,
        email: op.email,
        status: op.status as OperatorStatus,
        rejectionReason: op.rejectionReason ?? undefined,
      };
      return dto;
    });
  }

  // ================= PATCH REJECT OPERATOR =================
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Відхилити заявку оператора з причиною' })
  @ApiResponse({
    status: 200,
    description: 'Оператор відхилений успішно',
    type: AdminOperatorListDto,
  })
  async rejectOperator(
    @Req() req: Request & { user: { role: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectOperatorDto,
  ): Promise<AdminOperatorListDto> {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Доступ дозволено лише адміністраторам');
    }

    const rejectedOperator = await this.operatorService.rejectOperator(
      id,
      dto.rejectionReason,
    );

    const result: AdminOperatorListDto = {
      firstName: rejectedOperator.firstName,
      lastName: rejectedOperator.lastName,
      email: rejectedOperator.email,
      status: rejectedOperator.status as OperatorStatus,
      rejectionReason: rejectedOperator.rejectionReason ?? undefined,
    };

    return result;
  }
}
