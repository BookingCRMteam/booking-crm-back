import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateOperatorDto {
  @IsOptional()
  @Length(3, 100, {
    message: 'Company name must be between 3 and 100 characters long',
  })
  @Matches(/^(?!.*(--|\.\.))[\p{L}\p{N}\s.,'"-]+$/u, {
    message:
      'Company name may only contain letters, numbers, spaces, and symbols . , \' " - without repeats',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value as string | undefined;
  })
  companyName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  philosophy?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: 'Phone number must be valid and contain 9 to 15 digits',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;
}
