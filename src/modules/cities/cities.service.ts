// src/cities/cities.service.ts
import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ResponseCityDto } from './dto/response-city.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class CitiesService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('API_COUNTRY_STATE_CITY_URL')!;
    this.apiKey = this.configService.get<string>('API_COUNTRY_STATE_CITY_KEY')!;
    if (!this.apiUrl || !this.apiKey) {
      throw new ServiceUnavailableException(
        'CountriesService is not configured: missing API url or key',
      );
    }
  }

  async findAllByCountry(
    countryCode: string,
    query?: string,
  ): Promise<ResponseCityDto[]> {
    const cacheKey = `cities-${countryCode}`;

    console.log('🔍 Starting findAllByCountry for:', countryCode);

    console.log('🔑 Cache key:', cacheKey);
    console.log('🔌 Cache manager exists:', !!this.cacheManager);

    try {
      // Отримуємо дані з кешу
      console.log('📖 Attempting to get data from cache...');
      const cachedData = await this.cacheManager.get<string>(cacheKey);
      console.log('📊 Cache response type:', typeof cachedData);
      console.log('📊 Cache response length:', cachedData?.length || 0);

      if (cachedData) {
        console.log('Cities found in cache');
        const parsedData = JSON.parse(cachedData) as ResponseCityDto[];

        if (query) {
          const lowerCaseQuery = query.toLowerCase();
          return parsedData.filter((city) =>
            city.name.toLowerCase().startsWith(lowerCaseQuery),
          );
        }
        return parsedData;
      }
    } catch (error) {
      console.error('Error getting data from cache:', error);
      // Продовжуємо виконання, якщо є помилка з кешем
    }

    console.log('Cities not found in cache, fetching from API...');

    try {
      const headers = { 'X-CSCAPI-KEY': this.apiKey };
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/countries/${countryCode}/cities`, {
          headers,
        }),
      );

      const cities = response.data as ResponseCityDto[];
      console.log('Fetched cities from API:', cities.length);

      // Зберігаємо дані в кеші
      try {
        console.log('💾 Attempting to save to cache...');
        console.log('💾 Data to save length:', cities.length);
        console.log('💾 JSON string length:', JSON.stringify(cities).length);

        // Спробуємо різні способи збереження
        const dataToSave = JSON.stringify(cities);
        const saveResult = await this.cacheManager.set(
          cacheKey,
          dataToSave,
          86400000,
        ); // TTL в мілісекундах
        console.log('💾 Save result length:', saveResult.length);

        // Негайна перевірка
        console.log('🔍 Immediate cache check...');
        const immediateCheck = await this.cacheManager.get(cacheKey);
        console.log(
          '🔍 Immediate check result:',
          immediateCheck ? 'FOUND' : 'NOT FOUND',
        );
        console.log('🔍 Immediate check type:', typeof immediateCheck);

        if (immediateCheck) {
          console.log('✅ Data saved to cache successfully');
        } else {
          console.log('❌ Data NOT saved to cache');

          // Спробуємо альтернативний метод збереження
          console.log('🔄 Trying alternative save method...');
          await this.cacheManager.set(cacheKey, dataToSave);

          const altCheck = await this.cacheManager.get(cacheKey);
          console.log(
            '🔄 Alternative check result:',
            altCheck ? 'FOUND' : 'NOT FOUND',
          );
        }
      } catch (cacheError) {
        console.error('❌ Error saving to cache:', cacheError);
        console.error('❌ Cache error stack:', (cacheError as Error).stack);
      }

      // Фільтруємо дані
      if (query) {
        const lowerCaseQuery = query.toLowerCase();
        return cities.filter((city) =>
          city.name.toLowerCase().startsWith(lowerCaseQuery),
        );
      }

      return cities;
    } catch (apiError) {
      console.error('Error fetching from API:', apiError);
      throw apiError;
    }
  }
}
