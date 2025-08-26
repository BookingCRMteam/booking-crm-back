// src/cities/cities.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ResponseCityDto } from './dto/response-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get(':countryCode')
  @ApiOperation({ summary: 'Get a list of cities by country  codes' })
  @ApiParam({
    name: 'countryCode',
    description: 'ISO2 code of the country (e.g., US, UA)',
    example: 'UA',
    required: true,
  })
  @ApiQuery({
    name: 'q', // Назва параметра запиту
    description: 'Search term for city name',
    required: false, // Зробіть його необов’язковим
    example: 'Kyiv',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cities retrieved successfully',
    type: [ResponseCityDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Country code are required',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found: No cities found for the specified country',
  })
  async findAllByCountry(
    @Param('countryCode') countryCode: string,
    @Query('q') query?: string,
  ) {
    if (!countryCode) {
      throw new HttpException(
        'Country code and state code are required.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const cities = await this.citiesService.findAllByCountry(
      countryCode,
      query,
    );

    if (!cities || cities.length === 0) {
      throw new HttpException(
        'No cities found for the specified country and state.',
        HttpStatus.NOT_FOUND,
      );
    }

    return cities;
  }
}
