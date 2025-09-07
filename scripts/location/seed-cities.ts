import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '../../src/db/schema/schema';
import citiesData from './cities.json';
dotenv.config({ path: '.env.development' });

export async function seedCities() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });
  const { cities, cityTranslations } = schema;
  for (const city of citiesData) {
    const [inserted] = await db
      .insert(cities)
      .values({
        countryIso2: city.countryIso2 ?? '',
      })
      .returning({ id: cities.id });

    const cityId = inserted.id;

    await db.insert(cityTranslations).values({
      cityId,
      languageCode: 'en',
      name: city.name_en ?? '',
    });

    await db.insert(cityTranslations).values({
      cityId,
      languageCode: 'uk',
      name: city.name_uk ?? '',
    });
  }

  console.log('✅ Cities seeded');
}
