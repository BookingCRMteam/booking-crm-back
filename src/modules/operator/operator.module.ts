import { Module } from '@nestjs/common';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [OperatorController],
  providers: [OperatorService, UserService],
})
export class OperatorModule {}
