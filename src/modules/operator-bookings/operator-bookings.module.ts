import { Module } from '@nestjs/common';
import { OperatorBookingsController } from './operator-bookings.controller';
import { OperatorBookingsService } from './operator-bookings.service';
import { DrizzleModule } from '@app/db/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [OperatorBookingsController],
  providers: [OperatorBookingsService],
})
export class OperatorBookingsModule {}
