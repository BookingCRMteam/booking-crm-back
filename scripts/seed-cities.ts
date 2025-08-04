/* eslint-disable @typescript-eslint/no-unsafe-call */
// scripts/seed-cities.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '../src/db/schema'; // Ваш імпорт головної схеми
import { CITIES_DATA } from '../data/cities';

dotenv.config({ path: '../.env.development' });

async function seedCities() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('Starting city seeding...');

    // 1. Отримати всі існуючі країни з бази даних з правильною типізацією
    console.log('Fetching existing countries from the database...');
    // Використовуємо $inferSelect для автоматичного виведення типу з схеми
    type Country = typeof schema.countries.$inferSelect;

    const existingCountries =
      (await db.query.countries.findMany()) as unknown as Country[];
    const countryMap = new Map<string, number>(); // Map: countryName -> countryId
    existingCountries.forEach((country) => {
      // Тепер TypeScript знає, що country.name це string, а country.id це number
      countryMap.set(country.name, country.id);
    });

    if (countryMap.size === 0) {
      console.warn(
        'No countries found in the database. Please run `seed:countries` first.',
      );
      process.exit(1);
    }

    const citiesToInsert = [];
    let citiesSkipped = 0;

    // 2. Підготувати дані міст для вставки
    for (const cityData of CITIES_DATA) {
      const countryId = countryMap.get(cityData.countryName);
      if (countryId) {
        citiesToInsert.push({
          name: cityData.name,
          countryId: countryId,
        });
      } else {
        console.warn(
          `Skipping city "${cityData.name}": Country "${cityData.countryName}" not found in the database.`,
        );
        citiesSkipped++;
      }
    }

    if (citiesToInsert.length === 0) {
      console.log('No cities to insert after matching with countries.');
      process.exit(0);
    }

    // 3. Вставити міста в базу даних
    const insertedCities = await db
      .insert(schema.cities)
      .values(citiesToInsert)
      .onConflictDoNothing({
        target: [schema.cities.name, schema.cities.countryId],
      })
      .returning();

    if (insertedCities.length > 0) {
      console.log(`Successfully inserted ${insertedCities.length} new cities.`);
      console.log('Inserted cities:', insertedCities);
    } else {
      console.log('No new cities were inserted (they might already exist).');
    }

    if (citiesSkipped > 0) {
      console.warn(
        `Note: ${citiesSkipped} cities were skipped because their corresponding countries were not found.`,
      );
    }
  } catch (error) {
    console.error('Error during city seeding:', error);
    process.exit(1);
  } finally {
    if (pool) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await pool.end(); // Закриваємо з'єднання з базою даних
      console.log('Database connection closed.');
    }
    process.exit(0);
  }
}

seedCities();
