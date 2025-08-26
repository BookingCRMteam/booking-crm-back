import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';

@Controller('operator')
export class OperatorController {
  constructor(private readonly usersService: OperatorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Додати нового оператора',
    schema: {
      type: 'object',
      required: [
        'email',
        'firstName',
        'lastName',
        'website',
        'phone',
        'userId',
      ],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'operator@example.com',
        },
        firstName: {
          type: 'string',
          example: 'Іван',
        },
        lastName: {
          type: 'string',
          example: 'Іванов',
        },
        website: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com',
        },
        phone: {
          type: 'string',
          example: '+380501234567',
        },
      },
    },
  })
  addOperator(
    @Body() operatorInfoDTO: CreateOperatorDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.addOperator(operatorInfoDTO, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateOperator(
    @Body() operatorInfoDTO: CreateOperatorDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateOperator(operatorInfoDTO, req.user);
  }
}
