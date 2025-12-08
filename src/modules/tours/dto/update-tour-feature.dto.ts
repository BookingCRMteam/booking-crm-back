import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateTourFeatureDto {
  @ApiProperty({
    description: 'Status of the tour feature',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isFeatured: boolean;
}
