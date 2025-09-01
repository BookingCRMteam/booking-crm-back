// src/modules/tours/dto/get-tours-query.dto.ts
import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CountryISO2CodeEnum,
  getCountryCodes,
} from '@app/db/schema/enums/country-code.enum';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetToursQueryDto {
  @ApiPropertyOptional({
    example: '',
    description: 'ISO2 код країни призначення туру ',
    enum: getCountryCodes(),
  })
  @IsEnum(getCountryCodes(), {
    message: 'countryISO2Code must be a valid ISO2 country code.',
  })
  @MaxLength(2, { message: 'countryISO2Code must be exactly 2 characters.' })
  @IsOptional()
  countryISO2Code?: CountryISO2CodeEnum;

  @ApiProperty({
    example: null,
    description: 'ID of the destination city',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  cityId?: number;

  @ApiPropertyOptional({
    example: '',
    description: 'Type of the tour (e.g., Adventure, Sightseeing)',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  // Нові поля для діапазону дат
  @ApiPropertyOptional({
    example: '',
    description: 'Minimum start date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  minStartDate?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Maximum start date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  maxStartDate?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Minimum end date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  minEndDate?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Maximum end date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  maxEndDate?: string;

  @ApiPropertyOptional({
    example: null,
    description: 'Minimum price for the tour',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({
    example: null,
    description: 'Maximum price for the tour',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: null,
    description: 'Number of adults in the tour (e.g., 2)',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  adults?: number; // Зняв default тут, щоб @IsOptional працював коректно

  @ApiPropertyOptional({
    example: null,
    description: 'Number of children in the tour (e.g., 1)',
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  children?: number;

  @ApiPropertyOptional({
    example: null,
    description: 'Are pets allowed on the tour? (default: false)',
    type: Boolean,
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  petsAllowed?: boolean; // Зняв default

  @ApiPropertyOptional({
    example: null,
    description: 'ID of the departure city (reference to the cities table)',
    default: '',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  departureCityId?: number;

  @ApiPropertyOptional({
    example: '',
    description: 'ISO2 код країни призначення туру ',
    enum: getCountryCodes(),
  })
  @IsEnum(getCountryCodes(), {
    message: 'countryISO2Code must be a valid ISO2 country code.',
  })
  @MaxLength(2, { message: 'countryISO2Code must be exactly 2 characters.' })
  @IsOptional()
  departureCountryISO2Code?: CountryISO2CodeEnum;

  @ApiPropertyOptional({
    example: null,
    description: 'Limit for pagination',
    required: false,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    example: null,
    description: 'Offset for pagination',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({
    example: '',
    description: 'Field to sort by (e.g., startDate, price)',
    required: false,
    enum: ['startDate', 'price'],
  })
  @IsString()
  @IsOptional()
  sortBy?: 'startDate' | 'price';

  @ApiProperty({
    example: '',
    description: 'Sort order (asc or desc)',
    required: false,
    enum: SortOrder,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder;
}
