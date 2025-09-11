import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class GetCountriesDto {
  @ApiPropertyOptional({
    example: 'en',
    description: 'Language for country names',
    maxLength: 2,
    enum: ['uk', 'en'],
    default: 'en',
  })
  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'lang must be exactly 2 characters.' })
  lang?: string = 'en';

  @ApiPropertyOptional({
    example: null,
    description: 'Search query to filter countries by name',
    required: false,
  })
  @IsString()
  @IsOptional()
  q?: string;
}
