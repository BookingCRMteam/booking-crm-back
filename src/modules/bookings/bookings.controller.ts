import { Controller, Post, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Body()
    data: {
      tourId: number;
      userId: number;
      paymentProvider: 'stripe' | 'liqpay';
    },
  ) {
    const bookingDetails = await this.bookingsService.createBooking(data);
    return {
      message: 'Booking created. Redirect to payment link to complete.',
      ...bookingDetails,
    };
  }
}
