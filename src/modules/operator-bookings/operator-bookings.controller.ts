import {
  Controller,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { OperatorBookingsService } from './operator-bookings.service';
import { OperatorBookingResponseDto } from './dto/operator-booking-response.dto';
import { Request } from 'express';

interface JwtPayload {
  id: number; // або string, якщо id користувача зберігається як рядок
  email?: string;
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
  async getOperatorBookings(@Req() req: Request & { user?: JwtPayload }) {
    const user = req.user;
    if (!user || !user.id) {
      throw new UnauthorizedException('User not found in request');
    }

    return this.operatorBookingsService.getOperatorBookings(user.id);
  }
}
