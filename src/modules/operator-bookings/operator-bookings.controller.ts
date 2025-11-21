import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { OperatorBookingsService } from './operator-bookings.service';
import { OperatorBookingResponseDto } from './dto/operator-booking-response.dto';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
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
  async getOperatorBookings(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) return [];
    return this.operatorBookingsService.getOperatorBookings(userId);
  }
}
