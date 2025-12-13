import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsModule } from '../payments/payments.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [
    forwardRef(() => PaymentsModule),
    forwardRef(() => BookingsModule),
    EmailQueueModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
