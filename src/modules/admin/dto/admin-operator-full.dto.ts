import { ApiProperty } from '@nestjs/swagger';
import { OperatorStatus } from '@app/types/operator-status';

export class AdminOperatorFullDto {
  @ApiProperty() id: number;
  @ApiProperty() email: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() userId: number;
  @ApiProperty() companyName: string;
  @ApiProperty() description: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() website: string;
  @ApiProperty() phone: string;
  @ApiProperty({ enum: OperatorStatus }) status: OperatorStatus;
  @ApiProperty({ required: false }) philosophy?: string;
  @ApiProperty({ required: false }) photo?: string;
  @ApiProperty({ required: false }) rejectionReason?: string;
}
// dummy change for PR
