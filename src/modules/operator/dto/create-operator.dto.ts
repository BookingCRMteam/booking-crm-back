import {
  IsEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { IsFileValid } from '../../../common/validators/file-type-size.validator';

const NAME_PATTERN =
  /^(?!.*(--|''))(?!(?:.*[-']$)|(?:^[-']))[A-Za-zА-Яа-яЁёЇїІіЄєҐґ'-]{2,50}$/;

const NAME_ERROR_MESSAGE =
  'must be 2–50 characters long, contain only letters (Latin or Cyrillic), single hyphens or apostrophes. ' +
  'Digits, spaces, special characters, consecutive or leading/trailing separators are not allowed.';
const WEBSITE_URL_PATTERN =
  /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d{1,5})?(\/[^\s]*)?$/;

const WEBSITE_URL_ERROR_MESSAGE =
  'Website must start with http:// or https://, contain a valid domain, and not include spaces';

const COUNTRY_CODE_PATTERN = /^\+[1-9][0-9]{0,3}$/; // +380, +1, +44, etc.
const COUNTRY_CODE_ERROR =
  'Country code must start with + followed by 1–3 digits (e.g. +380, +1, +44)';

const PHONE_NUMBER_PATTERN = /^[1-9][0-9]{8,14}$/;
const PHONE_NUMBER_ERROR =
  'Phone number must contain only digits (9–15 characters), cannot start with 0, and cannot include spaces or symbols.';
export class CreateOperatorDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, {
    message: 'Company name must be between 2 and 100 characters',
  })
  companyName?: string;

  @IsOptional()
  @IsString()
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters',
  })
  description?: string;

  @ValidateIf(
    (o: CreateOperatorDto) =>
      o.countryCode !== undefined && o.countryCode !== '',
  )
  @IsString()
  @Matches(COUNTRY_CODE_PATTERN, {
    message: COUNTRY_CODE_ERROR,
  })
  countryCode?: string;

  @ValidateIf(
    (o: CreateOperatorDto) =>
      o.phoneNumber !== undefined && o.phoneNumber !== '',
  )
  @IsString()
  @Matches(PHONE_NUMBER_PATTERN, {
    message: PHONE_NUMBER_ERROR,
  })
  phoneNumber?: string;

  @IsString()
  @Length(2, 50, {
    message: 'First name must be between 2 and 50 characters',
  })
  @Matches(NAME_PATTERN, {
    message: `First name ${NAME_ERROR_MESSAGE}`,
  })
  firstName: string;

  @IsString()
  @Length(2, 50, {
    message: 'Last name must be between 2 and 50 characters',
  })
  @Matches(NAME_PATTERN, {
    message: `Last name ${NAME_ERROR_MESSAGE}`,
  })
  lastName: string;

  @IsString()
  @Length(13, 255, {
    message: 'Website URL must be between 13 and 255 characters long',
  })
  @Matches(WEBSITE_URL_PATTERN, {
    message: WEBSITE_URL_ERROR_MESSAGE,
  })
  website: string;

  @IsEmpty({ message: 'id cannot be provided in body' })
  id?: string;

  @IsEmpty({ message: 'email cannot be provided in body' })
  email?: string;

  @IsOptional()
  @IsFileValid(['image/jpeg', 'image/png'], 5, {
    message: 'Photo must be JPEG or PNG and up to 5MB',
  })
  photo: Express.Multer.File;
}
