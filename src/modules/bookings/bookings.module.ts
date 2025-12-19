import { Module, forwardRef } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingGateway } from './booking.gateway';
import { UserModule } from '../user/user.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [forwardRef(() => UserModule), EmailQueueModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingGateway],
  exports: [BookingsService, BookingGateway],
})
export class BookingsModule {}
