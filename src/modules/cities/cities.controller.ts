import { Controller, Get, Param, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { GetCitiesDto } from './dto/get-city.dto';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('countries/:iso2/cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiConsumes('multipart/form-data')
  async getCities(@Param('iso2') iso2: string, @Query() query: GetCitiesDto) {
    return this.citiesService.getCities(
      iso2.toUpperCase(),
      query.lang || 'en',
      query.q || '',
    );
  }
}
