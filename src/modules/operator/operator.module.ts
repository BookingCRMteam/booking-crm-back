import { Module } from '@nestjs/common';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';
import { UserService } from '../user/user.service';
import { CloudinaryModule } from '@app/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [OperatorController],
  providers: [OperatorService, UserService],
})
export class OperatorModule {}
