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

interface AuthUser {
  id: number;
}

interface AuthRequest extends Request {
  user?: AuthUser;
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
    type: [OperatorBookingResponseDto],
    description: 'Список бронювань',
  })
  async getOperatorBookings(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) return [];
    return this.operatorBookingsService.getOperatorBookings(userId);
  }
}
