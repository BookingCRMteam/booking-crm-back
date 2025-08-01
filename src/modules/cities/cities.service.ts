// src/cities/cities.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateCityDto } from './dto/create-city.dto';
import { FilterCityDto } from './dto/filter-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(private db: NodePgDatabase<typeof schema>) {}

  async create(createCityDto: CreateCityDto) {
    // Перевірка, чи існує країна з таким countryId
    const [country] = await this.db
      .select()
      .from(schema.countries)
      .where(eq(schema.countries.id, createCityDto.countryId))
      .limit(1);

    if (!country) {
      throw new BadRequestException(
        `Country with ID ${createCityDto.countryId} not found.`,
      );
    }

    // Перевірка, чи місто з такою назвою вже існує в цій країні
    const existingCity = await this.db
      .select()
      .from(schema.cities)
      .where(
        and(
          eq(schema.cities.name, createCityDto.name),
          eq(schema.cities.countryId, createCityDto.countryId),
        ),
      )
      .limit(1);

    if (existingCity.length > 0) {
      throw new Error(
        `City with name '${createCityDto.name}' already exists in this country.`,
      );
    }

    const [newCity] = await this.db
      .insert(schema.cities)
      .values(createCityDto)
      .returning();
    return newCity;
  }

  async findAll(filterDto: FilterCityDto) {
    const { countryId, page, limit } = filterDto;

    const query = this.db.select().from(schema.cities).$dynamic(); // Використовуємо $dynamic для умовних виразів

    if (countryId) {
      query.where(eq(schema.cities.countryId, countryId));
    }

    // Додаємо пагінацію
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    return query.execute();
  }

  async findOne(id: number) {
    const [city] = await this.db
      .select()
      .from(schema.cities)
      .where(eq(schema.cities.id, id))
      .limit(1);

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found.`);
    }
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const city = await this.findOne(id);
    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found.`);
    }
    return this.db
      .update(schema.cities)
      .set(updateCityDto)
      .where(eq(schema.cities.id, id))
      .returning();
  }

  async remove(id: number) {
    const city = await this.findOne(id);
    const result = await this.db
      .delete(schema.cities)
      .where(eq(schema.cities.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException(`City with ID ${id} not found.`);
    }
    return city;
  }
}
