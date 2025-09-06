import { IsOptional, IsString, Length } from 'class-validator';

export class GetCountriesDto {
  @IsString()
  @IsOptional()
  @Length(2, 5) // приклад: "en", "uk", "de-DE"
  lang?: string = 'en';
}
