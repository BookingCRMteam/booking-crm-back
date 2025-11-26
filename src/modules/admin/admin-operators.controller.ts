import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OperatorService } from '@app/modules/operator/operator.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AdminOperatorListDto } from './dto/admin-operator-list.dto';

@ApiTags('Admin')
@Controller('admin/operators')
export class AdminOperatorsController {
  constructor(private readonly operatorService: OperatorService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Список операторів зі статусом pending' })
  @ApiResponse({
    status: 200,
    description: 'Список операторів успішно отримано',
    type: [AdminOperatorListDto],
  })
  async getPendingOperators(): Promise<AdminOperatorListDto[]> {
    const operators = await this.operatorService.getOperatorsForVerification();

    return operators.map((op) => ({
      firstName: op.firstName,
      lastName: op.lastName,
      email: op.email,
      status: op.status,
    }));
  }
}
