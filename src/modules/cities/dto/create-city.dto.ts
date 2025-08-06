// src/cities/dto/create-city.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsInt()
  @Min(1)
  countryId: number;
}
