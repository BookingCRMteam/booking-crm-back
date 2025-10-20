// src/modules/tours/dto/get-tours-query.dto.ts
import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  IsEnum,
  Length,
  IsISO31661Alpha2,
  Validate,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateRangeValidator } from './date-range.validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetToursQueryDto {
  @Validate(DateRangeValidator)
  _dummy?: undefined;

  @ApiPropertyOptional({
    description: 'Language for tour details',
    example: 'en',
    default: 'en',
  })
  @IsString()
  @IsOptional()
  @Length(2, 5)
  lang?: string = 'en';

  @ApiPropertyOptional({
    example: 'UA',
    description: 'ISO2 код країни призначення туру ',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsISO31661Alpha2({
    message: 'countryISO2Code must be a valid ISO 3166-1 alpha-2 code.',
  })
  @IsOptional()
  countryISO2Code?: string;

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
    example: null,
    description: 'ID of the operator',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  operatorId?: number;

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
  @Transform(({ value }: { value: string }) =>
    value === '' ? undefined : value,
  )
  @IsDateString()
  @IsOptional()
  minStartDate?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Maximum start date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @Transform(({ value }: { value: string }) =>
    value === '' ? undefined : value,
  )
  @IsDateString()
  @IsOptional()
  maxStartDate?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Minimum end date for the tour search (YYYY-MM-DD)',
    required: false,
  })
  @Transform(({ value }: { value: string }) =>
    value === '' ? undefined : value,
  )
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
    description: 'Field to sort by (e.g., startDate, price, id)',
    required: false,
    enum: ['startDate', 'price', 'id'],
  })
  @IsIn(['startDate', 'price', 'id'])
  @IsString()
  @IsOptional()
  sortBy?: 'startDate' | 'price' | 'id';

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
