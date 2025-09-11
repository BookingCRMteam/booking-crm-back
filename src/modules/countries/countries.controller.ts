import { Controller, Get, Query } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { GetCountriesDto } from './dto/get-country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getCountries(@Query() query: GetCountriesDto) {
    return this.countriesService.getCountries(
      query.lang || 'en',
      query.q || '',
    );
  }
}
