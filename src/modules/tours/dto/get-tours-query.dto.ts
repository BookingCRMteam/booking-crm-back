import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger'; // Імпорт для Swagger

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetToursQueryDto {
  @ApiPropertyOptional({
    description: 'Filter tours by country',
  })
  @IsString({ message: 'Country must be a string.' })
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter tours by city' })
  @IsString({ message: 'City must be a string.' })
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter tours by type (e.g., "Sightseeing")',
  })
  @IsString({ message: 'Type must be a string.' })
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter tours starting on or after this date (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: 'startDate must be a valid date string (YYYY-MM-DD).' },
  )
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter tours ending on or before this date (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: 'endDate must be a valid date string (YYYY-MM-DD).' },
  )
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter tours with price greater than or equal to this value',
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'minPrice must be a number.' })
  @Min(0, { message: 'minPrice cannot be negative.' })
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter tours with price less than or equal to this value',
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'maxPrice must be a number.' })
  @Min(0, { message: 'maxPrice cannot be negative.' })
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Number of tours to return per page',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Offset for pagination (number of tours to skip)',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Offset must be a number.' })
  @Min(0, { message: 'Offset cannot be negative.' })
  @IsOptional()
  offset: number = 0;

  @ApiPropertyOptional({
    description: 'Field to sort tours by (e.g., "startDate", "price")',
  })
  @IsString({ message: 'sortBy must be a string.' })
  @IsOptional()
  sortBy?: string = 'startDate';

  @ApiPropertyOptional({
    description: 'Sort order (ascending or descending)',
    enum: SortOrder,
    example: SortOrder.ASC,
    default: SortOrder.ASC,
  })
  @IsEnum(SortOrder, { message: 'sortOrder must be either "asc" or "desc".' })
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.ASC;
}
