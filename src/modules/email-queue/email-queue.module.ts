// import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bullmq';
// import { EmailQueueProcessor } from './email-queue.processor';
// import { EmailQueueService } from './email-queue.service';

// @Module({
//   imports: [
//     BullModule.forRoot({
//       connection: {
//         host: process.env.REDIS_HOST || 'localhost',
//         port: parseInt(process.env.REDIS_PORT || '6379'),
//       },
//     }),
//     BullModule.registerQueue({
//       name: 'email',
//     }),
//   ],
//   providers: [EmailQueueProcessor, EmailQueueService],
//   exports: [EmailQueueService],
// })
// export class EmailQueueModule {}
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueProcessor } from './email-queue.processor';
import { EmailQueueService } from './email-queue.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL, // <--- головне!
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
