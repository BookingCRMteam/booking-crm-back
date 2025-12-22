import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { BookingStatsDto } from './dto/booking-stats.dto';
import { BookingsService } from './bookings.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ResponseBookingDto } from './dto/response-booking.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking and generate a payment link' })
  @ApiResponse({
    status: 201,
    description: 'Booking successfully created and payment link generated.',
    type: ResponseBookingDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({ type: CreateBookingDto })
  async create(
    @Body()
    data: CreateBookingDto,
  ) {
    const bookingDetails = await this.bookingsService.createBooking(data);
    return {
      message: 'Booking created. Redirect to payment link to complete.',
      ...bookingDetails,
    };
  }

  @Get(':id/expiration')
  @ApiOperation({
    summary: 'Get expiration time for a booking with pending_payment status',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking expiration details',
    schema: {
      type: 'object',
      properties: {
        bookingId: { type: 'number' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
        expiresAt: { type: 'string', format: 'date-time' },
        isExpired: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Booking is not in pending_payment status or missing payment session',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getExpiration(@Param('id') id: string) {
    return this.bookingsService.getBookingExpirationTime(Number(id));
  }

  @Post(':id/repay')
  @ApiOperation({ summary: 'Repay a booking that is pending payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment link generated.',
  })
  async repay(@Param('id') id: string) {
    return this.bookingsService.repayBooking(Number(id));
  }

  @Get(':tourId')
  @ApiOperation({ summary: 'Get booking statistics for a tour' })
  @ApiResponse({
    status: 200,
    description: 'Booking stats',
    type: BookingStatsDto,
  })
  async getStats(@Param('tourId') tourId: string) {
    const id = Number(tourId);
    return this.bookingsService.getTourBookingStats(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':tourId/:bookingId')
  @ApiOperation({ summary: 'Get booking details with tour information' })
  @ApiResponse({
    status: 200,
    description: 'Booking and tour details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBooking(
    @Param('tourId') tourId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingsService.getBookingWithTour(
      Number(bookingId),
      Number(tourId),
    );
  }
}
