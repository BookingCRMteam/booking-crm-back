import { ApiProperty } from '@nestjs/swagger';
import { OperatorStatus } from '@app/types/operator-status';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateOperatorStatusDto {
  @ApiProperty({ enum: OperatorStatus })
  @IsEnum(OperatorStatus)
  status: OperatorStatus;

  @ApiProperty({
    required: false,
    minLength: 50,
    description: 'Причина відмови (обовʼязково якщо статус rejected)',
  })
  @IsOptional()
  @IsString()
  @MinLength(50)
  rejectionReason?: string;
}
