import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
  MaxLength,
  IsISO31661Alpha2,
  Allow,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString } from '@app/common/validators';
export class TourPhotoDto {
  @IsUrl({}, { message: 'URL must be a valid URL address.' })
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Is this the main photo for the tour?',
    default: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean | undefined; // залишаємо як є для валідації
  })
  @IsBooleanString()
  @IsOptional()
  @Allow()
  isMain?: boolean;

  @ApiPropertyOptional({
    description: 'Description of the photo',
  })
  @IsString()
  @IsOptional()
  @Allow()
  description?: string;
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
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsISO31661Alpha2({
    message:
      'departureCountryISO2Code must be a valid ISO 3166-1 alpha-2 code.',
  })
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
    description:
      'Metadata for tour photos. The order should correspond to the uploaded files. Example: photos[0][isMain]=true&photos[0][description]=Main photo',
    type: [TourPhotoDto],
  })
  @IsArray({ message: 'Photos must be an array.' })
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as TourPhotoDto[];
      } catch {
        return [];
      }
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const objValue = value as Record<string, unknown>;
      const result: { [index: number]: TourPhotoDto } = {};
      Object.keys(objValue).forEach((key) => {
        const match = key.match(/^(\d+)$/);
        if (match) {
          const index = parseInt(match[1]);
          const photo = objValue[key];
          if (photo && typeof photo === 'object') {
            console.log(`Photo at index ${index}:`, photo);
            result[index] = photo as TourPhotoDto;
          }
        }
      });

      console.log('Transformed photos:', result);
      return result;
    }

    return value as TourPhotoDto[];
  })
  @Type(() => TourPhotoDto)
  photos: TourPhotoDto[];

  @ApiProperty({
    description: 'Array of photos (1–10 files, JPG/PNG, max 5MB each)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    minItems: 1,
    maxItems: 10,
  })
  @Allow()
  photo_files: Express.Multer.File[];

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
  @Type(() => Number)
  adults?: number;

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
  departureCityId?: number;

  @ApiPropertyOptional({
    description: 'ISO2 код країни відправлення туру ',
    default: '',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsISO31661Alpha2({
    message:
      'departureCountryISO2Code must be a valid ISO 3166-1 alpha-2 code.',
  })
  @IsOptional()
  departureCountryISO2Code?: string;
}
