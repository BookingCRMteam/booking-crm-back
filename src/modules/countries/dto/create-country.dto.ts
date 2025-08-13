import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    example: 'Ukraine', // Приклад значення
    description: 'The name of the country,minimum 1 character, maximum 100 ',
    maxLength: 100,
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^(?=.*[a-zA-Z])[a-zA-Z\s]+$/, {
    message:
      'Name must contain at least one letter and only letters and spaces.',
  })
  name: string;
}
