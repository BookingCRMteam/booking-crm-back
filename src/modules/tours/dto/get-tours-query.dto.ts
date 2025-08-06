// src/modules/tours/dto/get-tours-query.dto.ts
import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetToursQueryDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the destination country',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  countryId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the destination city',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  cityId?: number;

  @ApiProperty({
    example: 'Adventure',
    description: 'Type of the tour (e.g., Adventure, Sightseeing)',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  // Нові поля для діапазону дат
  @ApiProperty({
    example: '2025-03-01',
    description: 'Minimum start date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  minStartDate?: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Maximum start date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  maxStartDate?: string;

  @ApiProperty({
    example: '2025-03-10',
    description: 'Minimum end date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  minEndDate?: string;

  @ApiProperty({
    example: '2026-01-15',
    description: 'Maximum end date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  maxEndDate?: string;

  @ApiProperty({
    example: 500,
    description: 'Minimum price for the tour',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({
    example: 2000,
    description: 'Maximum price for the tour',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({
    example: 2,
    description: 'Number of adults in the tour (e.g., 2)',
    minimum: 1,
    required: false,
    default: 1, // Змінив default
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  adults?: number; // Зняв default тут, щоб @IsOptional працював коректно

  @ApiProperty({
    example: 1,
    description: 'Number of children in the tour (e.g., 1)',
    minimum: 0,
    required: false,
    default: 0, // Змінив default
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  children?: number; // Зняв default

  @ApiProperty({
    example: false,
    description: 'Are pets allowed on the tour? (default: false)',
    type: Boolean,
    required: false,
    default: false, // Змінив default
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  petsAllowed?: boolean; // Зняв default

  @ApiProperty({
    example: 1,
    description: 'ID of the departure city (reference to the cities table)',
    default: '',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  departureCityId?: number;

  @ApiProperty({
    example: 1,
    description:
      'ID of the departure country (reference to the countries table)',
    required: false,
    default: '',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  departureCountryId?: number;

  @ApiProperty({
    example: 10,
    description: 'Limit for pagination',
    required: false,
    minimum: 1,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    example: 0,
    description: 'Offset for pagination',
    required: false,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiProperty({
    example: 'startDate',
    description: 'Field to sort by (e.g., startDate, price)',
    required: false,
    enum: ['startDate', 'price'],
    default: 'startDate',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'startDate' | 'price';

  @ApiProperty({
    example: 'asc',
    description: 'Sort order (asc or desc)',
    required: false,
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder;
}
