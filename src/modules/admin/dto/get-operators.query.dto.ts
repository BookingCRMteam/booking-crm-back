import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OperatorStatus } from '@app/types/operator-status';

export class GetOperatorsQueryDto {
  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be greater than 0' })
  limit?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset must be an integer' })
  @Min(0, { message: 'offset must be >= 0' })
  offset?: number;

  @ApiPropertyOptional({ enum: OperatorStatus })
  @IsOptional()
  @IsEnum(OperatorStatus)
  status?: OperatorStatus;
}
