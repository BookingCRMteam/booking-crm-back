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
  Matches,
  NotContains,
  MinLength,
  Max,
  IsDivisibleBy,
  IsIn,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsAfter, IsAfterToday, IsBooleanLike } from '@app/common/validators';
export class CreateTourPhotoDto {
  @ApiPropertyOptional({
    description: 'Is this the main photo for the tour?',
    default: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean | undefined;
  })
  @IsBooleanLike()
  @IsOptional()
  isMain?: boolean;

  @ApiPropertyOptional({
    description: 'Description of the photo',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class TourPhotoDto extends CreateTourPhotoDto {
  @ApiPropertyOptional({
    description: 'URL of the photo (if already uploaded)',
  })
  @IsUrl({}, { message: 'URL must be a valid URL address.' })
  @IsOptional()
  url?: string;
}
export class CreateTourDto {
  @ApiProperty({
    description: 'Title of the tour (e.g. "Weekend Getaway to Paris")',
    maxLength: 255,
    default: '',
  })
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MinLength(3, { message: 'Title must be at least 3 characters long.' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters.' })
  @NotContains('>', { message: 'Title cannot contain HTML tags.' })
  @Matches(
    /^(?!.*<[^>]*>)(?!.*([.,\-'""])\1)(?![.,\-'""])(?:[\p{L}\p{N} .,\-'""]+)(?<![.,\-'""])$/u,
    {
      message:
        'Title must not start or end with special characters, and special characters cannot be repeated.',
    },
  )
  @Transform(({ value }: { value: string | undefined }) =>
    value ? value.trim() : undefined,
  )
  title: string;

  @ApiProperty({
    description:
      'Detailed description of the tour program (e.g. "Explore the Eiffel Tower, Louvre Museum, and enjoy a Seine river cruise.")',
    required: true,
    default: '',
  })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  @MinLength(50, {
    message: 'Description must be at least 50 characters long.',
  })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters.' })
  @NotContains('<', { message: 'Description cannot contain HTML tags.' })
  @NotContains('>', { message: 'Description cannot contain HTML tags.' })
  @Matches(
    /^(?!.*<[^>]*>)(?!.*style\s*=)(?!.*<\/?script[^>]*>)[\p{L}\p{N}\p{P}\p{S}\s]+$/u,
    {
      message: 'Description contains invalid characters.',
    },
  )
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

  @ApiProperty({
    example: '',
    description:
      'ID міста призначення туру ((отримано з GET /countries/{countryCode}/cities)) ',
    default: '',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  cityId: number;

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
  @IsNumber(
    {},
    { message: 'Price must be a number and use a dot as a decimal separator.' },
  )
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price can have a maximum of two decimal places.' },
  )
  @Min(100, { message: 'Price must be greater than or equal to 100.00' })
  @Max(100000, { message: 'Price must be less than or equal to 100000.00' })
  price: number;

  @ApiPropertyOptional({
    description: 'Валюта туру (за замовчуванням UAH)',
    maxLength: 3,
    enum: ['UAH', 'USD', 'EUR'],
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  @IsIn(['UAH', 'USD', 'EUR'])
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
  @IsAfterToday({ message: 'Start date must be after today.' })
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
  @IsAfter('startDate', { message: 'End date must be after start date.' })
  endDate: string;

  @ApiProperty({
    description: 'Number of available spots for the tour (e.g., 20)',
    default: '',
    minimum: 2,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'availableSpots must be a number.' })
  @IsNotEmpty({ message: 'availableSpots cannot be empty.' })
  @Min(2, { message: 'There must be at least 2 available spots.' })
  @Max(100, { message: 'The number of available spots cannot exceed 100.' })
  @IsDivisibleBy(2, {
    message: 'The number of available spots must be an even number.',
  })
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

  @ApiPropertyOptional({
    description:
      'Metadata for tour photos. The order should correspond to the uploaded files.',
    type: [TourPhotoDto],
  })
  // Трансформація для поля photos, щоб коректно обробляти різні формати вхідних даних (JSON-рядок, об'єкт, масив)
  // та забезпечити, що на вхід валідатора завжди надходитиме масив об'єктів TourPhotoDto.CreateTourPhotoDto.
  @Transform(({ value }) => {
    if (!value) {
      return []; // Повертаємо пустий масив, якщо дані відсутні
    }

    let photoData: unknown = value;
    // Якщо дані прийшли як JSON-рядок, розпарсюємо його
    if (typeof photoData === 'string') {
      try {
        photoData = JSON.parse(photoData);
      } catch (e) {
        console.error(e);
        return value as unknown; // У разі помилки парсингу повертаємо оригінальне значення, щоб валідатор видав помилку
      }
    }

    // Якщо дані є об'єктом (але не масивом), це може бути як один об'єкт фото,
    // так і об'єкт з індексами {'0': {...}, '1': {...}} з multipart/form-data.
    if (typeof photoData === 'object' && !Array.isArray(photoData)) {
      const keys = Object.keys(photoData);
      // Перевіряємо, чи є ключі числовими індексами
      const isArrayLike = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
      if (isArrayLike) {
        photoData = Object.values(photoData); // Перетворюємо в масив значень
      }
    }

    // Переконуємося, що дані є масивом. Якщо ні - загортаємо в масив.
    const photosArray = Array.isArray(photoData) ? photoData : [photoData];

    // Перетворюємо масив простих об'єктів на масив екземплярів CreateTourPhotoDto
    return plainToInstance(TourPhotoDto, photosArray);
  })
  @ValidateNested({ each: true })
  @Type(() => TourPhotoDto)
  @IsArray({ message: 'Photos must be an array.' })
  @IsOptional()
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
}
