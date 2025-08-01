import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
