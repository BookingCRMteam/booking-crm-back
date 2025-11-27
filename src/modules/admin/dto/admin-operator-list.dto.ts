import { ApiProperty } from '@nestjs/swagger';
import { OperatorStatus } from '@app/types/operator-status';

export class AdminOperatorListDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: OperatorStatus })
  status: OperatorStatus;

  @ApiProperty({ required: false })
  rejectionReason?: string;
}
