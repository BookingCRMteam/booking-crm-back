import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingGateway } from './booking.gateway';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, BookingGateway],
  exports: [BookingGateway],
})
export class BookingsModule {}
