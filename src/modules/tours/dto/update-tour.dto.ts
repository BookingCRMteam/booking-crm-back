import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTourDto } from './create-tour.dto';
import { IsDivisibleBy, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTourDto extends PartialType(CreateTourDto) {
  @ApiProperty({
    description: 'Number of available spots for the tour (e.g., 20)',
    default: 0,
    minimum: 0,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'availableSpots must be a number.' })
  @IsNotEmpty({ message: 'availableSpots cannot be empty.' })
  @Min(0, { message: 'There must be at least 0 available spots.' })
  @Max(100, { message: 'The number of available spots cannot exceed 100.' })
  @IsDivisibleBy(2, {
    message: 'The number of available spots must be an even number.',
  })
  availableSpots: number;
}
