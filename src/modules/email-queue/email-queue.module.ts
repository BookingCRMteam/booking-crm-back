import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueProcessor } from './email-queue.processor';
import { EmailQueueService } from './email-queue.service';
const isTest = process.env.NODE_ENV === 'test';
@Module({
  imports: [
    ...(isTest
      ? []
      : [
          BullModule.forRoot({
            connection: {
              url: process.env.REDIS_URL,
            },
          }),
          BullModule.registerQueue({
            name: 'email',
          }),
        ]),
  ],
  providers: [
    ...(isTest
      ? [
          {
            provide: EmailQueueService,
            useValue: {
              addBookingConfirmationEmail: () => Promise.resolve(),
            },
          },
        ]
      : [EmailQueueProcessor, EmailQueueService]),
  ],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}
