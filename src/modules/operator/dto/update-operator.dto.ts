import {
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

const NAME_PATTERN =
  /^(?!.*(--|''))(?!(?:.*[-']$)|(?:^[-']))[A-Za-zА-Яа-яЁёЇїІіЄєҐґ'-]{2,50}$/;

const NAME_ERROR_MESSAGE =
  'must be 2–50 characters long, contain only letters (Latin or Cyrillic), single hyphens or apostrophes. ' +
  'Digits, spaces, special characters, consecutive or leading/trailing separators are not allowed.';

export class UpdateOperatorDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, {
    message: 'Company name must be between 2 and 100 characters',
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
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters',
  })
  description?: string;

  @IsOptional()
  @IsString()
  philosophy?: string;

  @ValidateIf((o: UpdateOperatorDto) => o.phone !== undefined && o.phone !== '')
  @IsString()
  @Matches(/^\+?[1-9][0-9]{8,14}$/, {
    message:
      'Phone number must be digits only (9–15 chars), cannot start with 0, may include optional + at start',
  })
  phone?: string;

  @ValidateIf(
    (o: UpdateOperatorDto) => o.firstName !== undefined && o.firstName !== '',
  )
  @IsString()
  @Length(2, 50, {
    message: 'First name must be between 2 and 50 characters',
  })
  @Matches(NAME_PATTERN, {
    message: `First name ${NAME_ERROR_MESSAGE}`,
  })
  firstName?: string;

  @ValidateIf(
    (o: UpdateOperatorDto) => o.lastName !== undefined && o.lastName !== '',
  )
  @IsString()
  @Length(2, 50, {
    message: 'Last name must be between 2 and 50 characters',
  })
  @Matches(NAME_PATTERN, {
    message: `Last name ${NAME_ERROR_MESSAGE}`,
  })
  lastName?: string;

  @ValidateIf(
    (o: UpdateOperatorDto) => o.website !== undefined && o.website !== '',
  )
  @IsString()
  @Matches(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/, {
    message: 'Website must be a valid URL',
  })
  website?: string;
}
