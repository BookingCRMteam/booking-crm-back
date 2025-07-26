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
  @IsUrl({}, { message: 'URL must be a valid URL address.' })
  @IsNotEmpty({ message: 'URL cannot be empty.' })
  url: string;
}

export class CreateTourDto {
  @ApiProperty({
    description: 'Title of the tour (e.g. "Weekend Getaway to Paris")',
    maxLength: 255,
    default: '',
  })
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters.' })
  title: string;

  @ApiProperty({
    description:
      'Detailed description of the tour program (e.g. "Explore the Eiffel Tower, Louvre Museum, and enjoy a Seine river cruise.")',
    required: false,
    default: '',
  })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Country where the tour takes place (e.g., "France")',
    default: '',

    maxLength: 100,
  })
  @IsString({ message: 'Country must be a string.' })
  @IsNotEmpty({ message: 'Country cannot be empty.' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters.' })
  country: string;

  @ApiProperty({
    description:
      'City or region where the tour takes place (optional) (e.g., "Paris")',
    default: '',
    required: false,
    maxLength: 100,
  })
  @IsString({ message: 'City must be a string.' })
  @IsOptional()
  @MaxLength(100, { message: 'City cannot exceed 100 characters.' })
  city?: string;

  @ApiProperty({
    description: 'Type of the tour (e.g., "Sightseeing", "Beach", "Adventure")',
    default: '',
    maxLength: 100,
  })
  @IsString({ message: 'Type must be a string.' })
  @IsNotEmpty({ message: 'Type cannot be empty.' })
  @MaxLength(100, { message: 'Type cannot exceed 100 characters.' })
  type: string;

  @ApiProperty({
    description: 'Price per person for the tour (e.g., 1250.75)',
    default: '',
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
    description:
      'Start date of the tour in YYYY-MM-DD format (e.g., 2025-08-15)',
    default: '',
  })
  @IsDateString(
    {},
    { message: 'startDate must be a valid date string (e.g., YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'startDate cannot be empty.' })
  startDate: string;

  @ApiProperty({
    description: 'End date of the tour in YYYY-MM-DD format (e.g., 2025-08-22)',
    default: '',
  })
  @IsDateString(
    {},
    { message: 'endDate must be a valid date string (e.g., YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'endDate cannot be empty.' })
  endDate: string;

  @ApiProperty({
    description: 'Number of available spots for the tour (e.g., 20)',
    default: '',
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'availableSpots must be a number.' })
  @IsNotEmpty({ message: 'availableSpots cannot be empty.' })
  @Min(1, { message: 'There must be at least 1 available spot.' })
  availableSpots: number;

  @ApiProperty({
    description:
      'Terms and conditions for the tour (e.g. "Includes accommodation, breakfast. Excludes flights.") ',
    default: '',
    required: false,
  })
  @IsString({ message: 'Conditions must be a string.' })
  @IsOptional()
  conditions?: string;
  @ApiProperty({
    description: 'Array of image files to upload for the tour.',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary', // Це вказує Swagger, що очікується файл
    },
    required: true,
    default: true,
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
