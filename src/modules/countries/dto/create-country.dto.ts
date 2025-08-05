import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    example: 'Ukraine', // Приклад значення
    description: 'The name of the country', // Опис поля
    maxLength: 100,
    default: '', // Максимальна довжина (для документації)
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
