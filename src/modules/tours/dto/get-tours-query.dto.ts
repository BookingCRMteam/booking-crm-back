import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

// Визначимо ENUM для порядку сортування (ASC/DESC)
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetToursQueryDto {
  @IsString({ message: 'Country must be a string.' })
  @IsOptional()
  country?: string;

  @IsString({ message: 'City must be a string.' })
  @IsOptional()
  city?: string;

  @IsString({ message: 'Type must be a string.' })
  @IsOptional()
  type?: string;

  @IsDateString(
    {},
    { message: 'startDate must be a valid date string (YYYY-MM-DD).' },
  )
  @IsOptional()
  startDate?: string;

  @IsDateString(
    {},
    { message: 'endDate must be a valid date string (YYYY-MM-DD).' },
  )
  @IsOptional()
  endDate?: string;

  @Type(() => Number) // Трансформуємо рядок у число
  @IsNumber({}, { message: 'minPrice must be a number.' })
  @Min(0, { message: 'minPrice cannot be negative.' })
  @IsOptional()
  minPrice?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'maxPrice must be a number.' })
  @Min(0, { message: 'maxPrice cannot be negative.' })
  @IsOptional()
  maxPrice?: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @IsOptional()
  limit: number = 10; // Значення за замовчуванням

  @Type(() => Number)
  @IsNumber({}, { message: 'Offset must be a number.' })
  @Min(0, { message: 'Offset cannot be negative.' })
  @IsOptional()
  offset: number = 0; // Значення за замовчуванням

  @IsString({ message: 'sortBy must be a string.' })
  @IsOptional()
  sortBy?: string = 'startDate'; // Значення за замовчуванням

  @IsEnum(SortOrder, { message: 'sortOrder must be either "asc" or "desc".' })
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.ASC; // Значення за замовчуванням
}
