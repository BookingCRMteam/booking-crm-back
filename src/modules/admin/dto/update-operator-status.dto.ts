import { ApiProperty } from '@nestjs/swagger';
import { OperatorStatus } from '@app/types/operator-status';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateOperatorStatusDto {
  @ApiProperty({ enum: OperatorStatus })
  @IsEnum(OperatorStatus)
  status: OperatorStatus;

  @ApiProperty({
    required: false,
    minLength: 10,
    maxLength: 500,
    description: 'Причина відмови (обовʼязково якщо статус rejected)',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @Matches(/^[^<>]*$/, {
    message: 'HTML tags are not allowed in rejectionReason',
  })
  rejectionReason?: string;
}
