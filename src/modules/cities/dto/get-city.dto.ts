import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class GetCitiesDto {
  @ApiProperty({
    example: null,
    description: 'Language for city names',
    maxLength: 2,
    enum: ['uk', 'en'], // Можливо, варто використовувати enum
  })
  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'lang must be exactly 2 characters.' })
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
