import { Controller, Post, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ResponseBookingDto } from './dto/response-booking.dto';

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
}
