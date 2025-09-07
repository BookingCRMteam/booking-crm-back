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
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    example: 'UA',
    description: 'ISO2 код країни призначення туру ',
  })
  @IsString()
  @Length(2, 2, { message: 'countryISO2Code must be exactly 2 characters.' })
  @IsNotEmpty()
  countryISO2Code: string;

  @ApiPropertyOptional({
    example: '',
    description:
      'ID міста призначення туру ((отримано з GET /countries/{countryCode}/cities)) ',
    default: '',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Type of the tour (e.g., "Sightseeing", "Beach", "Adventure")',
    default: '',
    maxLength: 100,
  })
  @IsString({ message: 'Type must be a string.' })
  @MaxLength(100, { message: 'Type cannot exceed 100 characters.' })
  @IsOptional()
  type?: string;

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

  @ApiPropertyOptional({
    description: 'Валюта туру (за замовчуванням UAH)',
    maxLength: 3,
    enum: ['UAH', 'USD', 'EUR'], // Можливо, варто використовувати enum
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string = 'UAH';

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

  @ApiPropertyOptional({
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
      format: 'binary',
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

  @ApiPropertyOptional({
    description: 'Is the tour currently active and available for booking?',
    required: false,
    default: '',
  })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Number of adults in the tour (e.g., 2)',
    minimum: 1,
    required: false,
    default: '',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  adults?: number = 1;

  @ApiProperty({
    description: 'Number of children in the tour (e.g., 1)',
    minimum: 0,
    required: false,
    default: '',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  children?: number = 0;

  @ApiPropertyOptional({
    description: 'Are pets allowed on the tour? (default: false)',
    type: Boolean,
    required: false,
    default: '',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  petsAllowed?: boolean = false;

  @ApiPropertyOptional({
    description: 'ID of the departure city (get from endpoint /cities)',
    example: '',
    required: false,
    default: '',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  departureCityId?: number;

  @ApiPropertyOptional({
    description: 'ISO2 код країни призначення туру ',
    default: '',
  })
  @IsString()
  @Length(2, 2, {
    message: 'departureCountryISO2Code must be exactly 2 characters.',
  })
  @IsOptional()
  departureCountryISO2Code?: string;
}
