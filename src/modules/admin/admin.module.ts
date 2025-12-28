import { Module } from '@nestjs/common';
import { AdminOperatorsController } from './admin-operators.controller';
import { OperatorService } from '@app/modules/operator/operator.service';
import { UserService } from '@app/modules/user/user.service';
import { CloudinaryModule } from '@app/cloudinary/cloudinary.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [CloudinaryModule, EmailQueueModule],
  controllers: [AdminOperatorsController],
  providers: [OperatorService, UserService],
})
export class AdminModule {}
