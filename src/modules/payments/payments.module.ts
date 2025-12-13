import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [forwardRef(() => BookingsModule), EmailQueueModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
