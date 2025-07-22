import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TourPhotoDto {
  @ApiProperty({
    description: 'URL of the tour photo',
    example: 'https://example.com/tour-photo-1.jpg',
  })
  @IsUrl({}, { message: 'URL must be a valid URL address.' })
  @IsNotEmpty({ message: 'URL cannot be empty.' })
  url: string;

  @ApiProperty({
    description: 'Optional description for the photo',
    required: false,
    example: 'Beautiful landscape of the Alps',
  })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiProperty({
    description: 'Is this the main photo for the tour?',
    required: false,
    default: false,
  })
  @IsBoolean({ message: 'isMain must be a boolean value.' })
  @IsOptional()
  isMain?: boolean;
}

export class CreateTourDto {
  @ApiProperty({
    description: 'Title of the tour',
    example: 'Weekend Getaway to Paris',
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters.' })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the tour program',
    required: false,
    example:
      'Explore the Eiffel Tower, Louvre Museum, and enjoy a Seine river cruise.',
  })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Country where the tour takes place',
    example: 'France',
    maxLength: 100,
  })
  @IsString({ message: 'Country must be a string.' })
  @IsNotEmpty({ message: 'Country cannot be empty.' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters.' })
  country: string;

  @ApiProperty({
    description: 'City or region where the tour takes place (optional)',
    required: false,
    example: 'Paris',
    maxLength: 100,
  })
  @IsString({ message: 'City must be a string.' })
  @IsOptional()
  @MaxLength(100, { message: 'City cannot exceed 100 characters.' })
  city?: string;

  @ApiProperty({
    description: 'Type of the tour (e.g., "Sightseeing", "Beach", "Adventure")',
    example: 'Sightseeing',
    maxLength: 100,
  })
  @IsString({ message: 'Type must be a string.' })
  @IsNotEmpty({ message: 'Type cannot be empty.' })
  @MaxLength(100, { message: 'Type cannot exceed 100 characters.' })
  type: string;

  @ApiProperty({
    description: 'Price per person for the tour',
    example: '1250.75',
    type: String,
    pattern: '^\\d+(\\.\\d{1,2})?$',
  })
  @IsNotEmpty({ message: 'Price cannot be empty.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0, { message: 'Price cannot be negative.' })
  price: number;

  @ApiProperty({
    description: 'Currency of the tour price (e.g., UAH, USD, EUR)',
    required: false,
    default: 'UAH',
    maxLength: 3,
  })
  @IsString({ message: 'Currency must be a string.' })
  @IsOptional()
  @MaxLength(3, {
    message: 'Currency must be a 3-letter code (e.g., UAH, USD).',
  })
  currency?: string;

  @ApiProperty({
    description: 'Start date of the tour in YYYY-MM-DD format',
    example: '2025-08-15',
  })
  @IsDateString(
    {},
    { message: 'startDate must be a valid date string (e.g., YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'startDate cannot be empty.' })
  startDate: string;

  @ApiProperty({
    description: 'End date of the tour in YYYY-MM-DD format',
    example: '2025-08-22',
  })
  @IsDateString(
    {},
    { message: 'endDate must be a valid date string (e.g., YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'endDate cannot be empty.' })
  endDate: string;

  @ApiProperty({
    description: 'Number of available spots for the tour',
    example: 20,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'availableSpots must be a number.' })
  @IsNotEmpty({ message: 'availableSpots cannot be empty.' })
  @Min(1, { message: 'There must be at least 1 available spot.' })
  availableSpots: number;

  @ApiProperty({
    description:
      'Terms and conditions for the tour (e.g., inclusions, exclusions)',
    required: false,
    example: 'Includes accommodation, breakfast. Excludes flights.',
  })
  @IsString({ message: 'Conditions must be a string.' })
  @IsOptional()
  conditions?: string;

  @ApiProperty({
    description:
      'Array of tour photos with URLs and optional descriptions/main status',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsArray({ message: 'Photos must be an array.' })
  @ArrayMinSize(1, {
    message: 'At least one photo URL is required for a tour.',
  })
  @ValidateNested({ each: true })
  @Type(() => TourPhotoDto)
  @IsOptional()
  photos: TourPhotoDto[];

  @ApiProperty({
    description: 'Is the tour currently active and available for booking?',
    required: false,
    default: true,
  })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;
}
