import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectOperatorDto {
  @ApiProperty({ description: 'Причина відхилення заявки оператора' })
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  rejectionReason: string;
}
