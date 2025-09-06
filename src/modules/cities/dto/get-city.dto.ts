import { IsOptional, IsString, Length } from 'class-validator';

export class GetCitiesDto {
  @IsString()
  @IsOptional()
  @Length(2, 5)
  lang?: string = 'en';
}
