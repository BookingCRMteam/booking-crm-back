// src/countries/countries.controller.ts
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { ResponseCountryDto } from './dto/response-country.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get a list of countries ',
  })
  @ApiQuery({
    name: 'q', // Назва параметра запиту
    description: 'Search term for country name',
    required: false, // Зробіть його необов’язковим
    example: 'Ukraine',
  })
  @ApiResponse({
    status: 200,
    description: 'List of countries retrieved successfully',
    type: [ResponseCountryDto],
  })
  async findAll(@Query('q') query?: string) {
    const countries = await this.countriesService.findAll(query);
    if (!countries || countries.length === 0) {
      throw new HttpException(
        'No countries found for the specified country and state.',
        HttpStatus.NOT_FOUND,
      );
    }

    return countries;
  }
}
