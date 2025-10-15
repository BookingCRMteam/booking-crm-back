import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsFileValid } from '../../common/validators/file-type-size.validator';

const NAME_PATTERN =
  /^(?!.*(--|''))(?!(?:.*[-']$)|(?:^[-']))[A-Za-zА-Яа-яЁёЇїІіЄєҐґ'-]{2,50}$/;

const NAME_ERROR_MESSAGE =
  'must be 2–50 characters long, contain only letters (Latin or Cyrillic), single hyphens or apostrophes. ' +
  'Digits, spaces, special characters, consecutive or leading/trailing separators are not allowed.';
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

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9][0-9]{8,14}$/, {
    message:
      'Phone number must be digits only (9–15 chars), cannot start with 0, may include optional + at start',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Firstname is required' })
  @Length(2, 50, {
    message: 'First name must be between 2 and 50 characters',
  })
  @Matches(NAME_PATTERN, {
    message: `First name ${NAME_ERROR_MESSAGE}`,
  })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'LastName is required' })
  @Length(2, 50, {
    message: 'Last name must be between 2 and 50 characters',
  })
  @Matches(NAME_PATTERN, {
    message: `Last name ${NAME_ERROR_MESSAGE}`,
  })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Website is required' })
  @Matches(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/, {
    message: 'Website must be a valid URL',
  })
  website: string;

  @IsEmpty({ message: 'id cannot be provided in body' })
  id?: string;

  @IsEmpty({ message: 'email cannot be provided in body' })
  email?: string;

  @IsNotEmpty({ message: 'Photo is required' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsFileValid(['image/jpeg', 'image/png'], 5, {
    message: 'Photo must be JPEG or PNG and up to 5MB',
  })
  photo: Express.Multer.File;
}
