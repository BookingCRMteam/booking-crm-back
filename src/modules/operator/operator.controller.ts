import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { OperatorService } from './operator.service';
import { OperatorInfoDto } from './dto/operatorInfo.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';

@Controller('operator')
export class OperatorController {
  constructor(private readonly usersService: OperatorService) {}

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Додати нового оператора',
    schema: {
      type: 'object',
      required: [
        'email',
        'companyName',
        'description',
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
        companyName: {
          type: 'string',
          example: 'ТОВ Євро-Тур',
        },
        description: {
          type: 'string',
          example: 'Надійний туроператор з досвідом понад 10 років',
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
    @Body() operatorInfoDTO: OperatorInfoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.addOperator(operatorInfoDTO, req.user);
  }
}
