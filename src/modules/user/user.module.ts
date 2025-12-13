import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BookingsService } from '@app/modules/bookings/bookings.service';
import { PaymentsService } from '@app/modules/payments/payments.service';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [
    forwardRef(() => PaymentsModule),
    forwardRef(() => BookingsModule),
    EmailQueueModule,
  ],
  providers: [UserService, BookingsService, PaymentsService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
