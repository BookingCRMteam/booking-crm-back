import {
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateOperatorDto {
  [x: string]: string;
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
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: 'Phone number must be valid and contain 9 to 15 digits',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Firstname is required' })
  @Length(2, 50, {
    message: 'First name must be between 2 and 50 characters',
  })
  @Matches(/^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ'’ -]+$/, {
    message: 'First name must contain only letters and cannot include digits',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'LastName is required' })
  @Length(2, 50, {
    message: 'Last name must be between 2 and 50 characters',
  })
  @Matches(/^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ'’ -]+$/, {
    message: 'Last name must contain only letters and cannot include digits',
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
}
