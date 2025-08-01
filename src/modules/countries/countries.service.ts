// src/countries/countries.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { countries } from './countries.schema';

@Injectable()
export class CountriesService {
  constructor(private db: NodePgDatabase<Record<string, unknown>> = this.db) {}

  async create(createCountryDto: CreateCountryDto) {
    // Перевіряємо, чи країна з такою назвою вже існує
    const existingCountry = await this.db
      .select()
      .from(countries)
      .where(eq(countries.name, createCountryDto.name))
      .limit(1);

    if (existingCountry.length > 0) {
      throw new Error(
        `Country with name '${createCountryDto.name}' already exists.`,
      );
    }

    const [newCountry] = await this.db
      .insert(countries)
      .values(createCountryDto)
      .returning(); // Повертаємо створену країну
    return newCountry;
  }

  async findAll() {
    return this.db.select().from(countries);
  }

  async findOne(id: number) {
    const [country] = await this.db
      .select()
      .from(countries)
      .where(eq(countries.id, id))
      .limit(1);

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found.`);
    }
    return country;
  }

  async update(id: number, updateCountryDto: UpdateCountryDto) {
    const country = await this.findOne(id);
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found.`);
    }
    return this.db
      .update(countries)
      .set(updateCountryDto)
      .where(eq(countries.id, id))
      .returning();
  }

  async remove(id: number) {
    const country = await this.findOne(id);
    const result = await this.db
      .delete(countries)
      .where(eq(countries.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException(`Country with ID ${id} not found.`);
    }
    return country;
  }
}
