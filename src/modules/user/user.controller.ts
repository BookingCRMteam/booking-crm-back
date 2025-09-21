import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { UserService } from './user.service';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Update user info',
    type: UpdateUserInfoDto,
    examples: {
      example1: {
        summary: 'Example payload',
        value: {
          firstPersonName: 'Іван',
          firstPersonSurname: 'Іванов',
          secondPersonName: 'Марія',
          secondPersonSurname: 'Петренко',
          phone: '+380501234567',
        },
      },
    },
  })
  updateUser(
    @Body() updateUserInfoDto: UpdateUserInfoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateUser(req.user.id, updateUserInfoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBody({
    description: 'Get user info',
    examples: {
      example1: {
        summary: 'Example payload',
        value: {
          id: 1,
          sub: 'auth0|1234567890',
          firstPersonName: 'Іван',
          firstPersonSurname: 'Іванов',
          secondPersonName: 'Марія',
          secondPersonSurname: 'Петренко',
          email: 'example@gmail.com',
        },
      },
    },
  })
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getById(req.user.id);
  }
}
