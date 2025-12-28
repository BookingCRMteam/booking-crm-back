import { Module } from '@nestjs/common';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';
import { UserService } from '../user/user.service';
import { CloudinaryModule } from '@app/cloudinary/cloudinary.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [CloudinaryModule, EmailQueueModule],
  controllers: [OperatorController],
  providers: [OperatorService, UserService],
})
export class OperatorModule {}
