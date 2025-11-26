import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueProcessor } from './email-queue.processor';
import { EmailQueueService } from './email-queue.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailQueueProcessor, EmailQueueService],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}
