// src/countries/countries.service.ts
import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ResponseCountryDto } from './dto/response-country.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { AxiosError } from 'axios';

@Injectable()
export class CountriesService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    // Правильний спосіб ін'єкції Drizzle DB в NestJS
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('API_COUNTRY_STATE_CITY_URL');
    this.apiKey = this.configService.get<string>('API_COUNTRY_STATE_CITY_KEY');
  }

  async findAll(query?: string): Promise<ResponseCountryDto[]> {
    const cacheKey = `countries`;
    try {
      const cachedData = await this.cacheManager.get<string>(cacheKey);
      if (cachedData) {
        this.logger.debug('Countries found in cache');
        const parsedData = JSON.parse(cachedData) as ResponseCountryDto[];

        if (query) {
          const lowerCaseQuery = query.toLowerCase();
          return parsedData.filter((country) =>
            country.name.toLowerCase().startsWith(lowerCaseQuery),
          );
        }
        return parsedData;
      }
    } catch (error) {
      this.logger.warn(
        `Error getting data from cache: ${(error as Error).message}`,
      );
    }

    this.logger.debug('Countries not found in cache, fetching from API...');
    try {
      const headers = { 'X-CSCAPI-KEY': this.apiKey };
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/countries`, { headers }),
      );
      const countries = response.data as ResponseCountryDto[];
      try {
        const dataToSave = JSON.stringify(countries);
        await this.cacheManager.set(cacheKey, dataToSave);
      } catch (cacheError) {
        this.logger.warn(
          `Error saving to cache: ${(cacheError as Error).message}`,
        );
      }
      if (query) {
        const lowerCaseQuery = query.toLowerCase();
        return countries.filter((country) =>
          country.name.toLowerCase().startsWith(lowerCaseQuery),
        );
      }

      return countries;
    } catch (apiError) {
      const err = apiError as AxiosError;
      const status = err.response?.status;
      this.logger.error(
        `Countries API error${status ? ` (${status})` : ''}: ${err.message}`,
      );
      throw new ServiceUnavailableException(
        'Countries API is unavailable. Please try again later.',
      );
    }
  }
}
