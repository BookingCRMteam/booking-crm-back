import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { OperatorInfoDto } from './dto/operatorInfo.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';

@Controller('operator')
export class OperatorController {
  constructor(private readonly usersService: OperatorService) {}

  @UseGuards(JwtAuthGuard)
  @Patch()
  addOperator(
    @Body() operatorInfoDTO: OperatorInfoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.addOperator(operatorInfoDTO, req.user);
  }
}
