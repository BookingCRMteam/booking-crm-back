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

export class TourPhotoDto {
  @IsUrl({}, { message: 'URL must be a valid URL address.' })
  @IsNotEmpty({ message: 'URL cannot be empty.' })
  url: string;

  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @IsBoolean({ message: 'isMain must be a boolean value.' })
  @IsOptional()
  isMain?: boolean;
}

export class CreateTourDto {
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters.' })
  title: string;

  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Country must be a string.' })
  @IsNotEmpty({ message: 'Country cannot be empty.' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters.' })
  country: string;

  @IsString({ message: 'City must be a string.' })
  @IsOptional()
  @MaxLength(100, { message: 'City cannot exceed 100 characters.' })
  city?: string;

  @IsString({ message: 'Type must be a string.' })
  @IsNotEmpty({ message: 'Type cannot be empty.' })
  @MaxLength(100, { message: 'Type cannot exceed 100 characters.' })
  type: string;

  @IsNotEmpty({ message: 'Price cannot be empty.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0, { message: 'Price cannot be negative.' })
  price: number;

  @IsString({ message: 'Currency must be a string.' })
  @IsOptional()
  @MaxLength(3, {
    message: 'Currency must be a 3-letter code (e.g., UAH, USD).',
  })
  currency?: string;

  @IsDateString(
    {},
    { message: 'startDate must be a valid date string (e.g., YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'startDate cannot be empty.' })
  startDate: string;

  @IsDateString(
    {},
    { message: 'endDate must be a valid date string (e.g., YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'endDate cannot be empty.' })
  endDate: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'availableSpots must be a number.' })
  @IsNotEmpty({ message: 'availableSpots cannot be empty.' })
  @Min(1, { message: 'There must be at least 1 available spot.' })
  availableSpots: number;

  @IsString({ message: 'Conditions must be a string.' })
  @IsOptional()
  conditions?: string;

  @IsArray({ message: 'Photos must be an array.' })
  @ArrayMinSize(1, {
    message: 'At least one photo URL is required for a tour.',
  })
  @ValidateNested({ each: true })
  @Type(() => TourPhotoDto)
  @IsOptional()
  photos: TourPhotoDto[];

  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;
}
