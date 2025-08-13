import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class OperatorInfoDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @Length(2, 100, {
    message: 'Company name must be between 2 and 100 characters',
  })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @Length(10, 500, {
    message: 'Description must be between 10 and 500 characters',
  })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: 'Phone number must be valid and contain 9 to 15 digits',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Contact person is required' })
  @Length(2, 50, {
    message: 'Contact person name must be between 5 and 50 characters',
  })
  contactPerson: string;

  @IsString()
  @IsNotEmpty({ message: 'Website is required' })
  @Matches(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/, {
    message: 'Website must  be a valid URL',
  })
  website: string;
}
