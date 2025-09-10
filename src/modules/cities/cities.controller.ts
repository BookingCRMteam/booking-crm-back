import { Controller, Get, Param, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CountryParamsDto, GetCitiesDto } from './dto/get-city.dto';

@Controller('countries/:iso2/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async getCities(
    @Param() params: CountryParamsDto,
    @Query() query: GetCitiesDto,
  ) {
    return this.citiesService.getCities(
      params.iso2,
      query.lang || 'en',
      query.q || '',
    );
  }
}
