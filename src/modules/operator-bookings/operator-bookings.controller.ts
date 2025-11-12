import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { OperatorBookingsService } from './operator-bookings.service';
import { Request } from 'express';
import { OperatorBookingResponseDto } from './dto/operator-booking-response.dto';

interface AuthenticatedUser {
  id: number;
}

interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

@ApiTags('Operator Bookings')
@ApiBearerAuth()
@Controller('operator-bookings')
@UseGuards(JwtAuthGuard)
export class OperatorBookingsController {
  constructor(
    private readonly operatorBookingsService: OperatorBookingsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Отримати всі оплачені бронювання туроператора' })
  @ApiResponse({
    status: 200,
    description: 'Список успішних бронювань',
    type: [OperatorBookingResponseDto],
  })
  async getOperatorBookings(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (typeof userId !== 'number') {
      return [];
    }

    return this.operatorBookingsService.getOperatorBookings(userId);
  }
}
