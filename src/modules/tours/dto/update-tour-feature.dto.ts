import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsDefined } from 'class-validator';

export class UpdateTourFeatureDto {
  @ApiProperty({
    description: 'Status of the tour feature',
    example: true,
  })
  @IsDefined()
  @IsBoolean()
  @IsNotEmpty()
  isFeatured: boolean;
}
