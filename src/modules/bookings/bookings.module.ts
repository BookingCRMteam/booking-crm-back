import { Module, forwardRef } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingGateway } from './booking.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [BookingsController],
  providers: [BookingsService, BookingGateway],
  exports: [BookingGateway],
})
export class BookingsModule {}
