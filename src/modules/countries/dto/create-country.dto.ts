import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    example: 'Ukraine', // Приклад значення
    description: 'The name of the country,minimum 1 character, maximum 100 ', // Опис поля
    maxLength: 100,
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
