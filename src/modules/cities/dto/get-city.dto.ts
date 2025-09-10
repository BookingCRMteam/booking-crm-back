import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import * as countriesLib from 'i18n-iso-countries';
import * as enLocale from 'i18n-iso-countries/langs/en.json';

countriesLib.registerLocale(enLocale);

const countryAlpha2Codes = Object.keys(countriesLib.getAlpha2Codes());

export type CountryCode = (typeof countryAlpha2Codes)[number];

const CountryCodeEnum = Object.fromEntries(
  countryAlpha2Codes.map((code) => [code, code]),
);

export class CountryParamsDto {
  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    enum: countryAlpha2Codes,
    example: 'UA',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(CountryCodeEnum, {
    message: `iso2 must be one of the following values: ${countryAlpha2Codes.join(
      ', ',
    )}`,
  })
  iso2: CountryCode;
}

export class GetCitiesDto {
  @ApiProperty({
    example: 'en',
    description: 'Language for city names',
    maxLength: 2,
    enum: ['uk', 'en'],
    default: 'en',
  })
  @IsString()
  @IsOptional()
  @Length(2, 2, { message: 'lang must be exactly 2 characters.' })
  lang?: string = 'en';

  @ApiPropertyOptional({
    example: null,
    description: 'Search query to filter cities by name',
    required: false,
  })
  @IsString()
  @IsOptional()
  q?: string;
}
