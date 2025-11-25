import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckAvailabilityDto {
  @ApiProperty({ example: 1, description: 'The ID of the tour' })
  @IsInt()
  @IsNotEmpty()
  tourId: number;

  @ApiProperty({ example: 2, description: 'Number of spots to check' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  spots: number;
}
