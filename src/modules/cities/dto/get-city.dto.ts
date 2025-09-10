import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class GetCitiesDto {
  @ApiProperty({
    example: null,
    description: 'Language for city names',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(2, 5)
  lang?: string = 'en';

  @ApiPropertyOptional({
    example: null,
    description: 'Search query to filter cities by name',
    required: false,
  })
  @IsString()
  @IsOptional()
  q?: string;
}
