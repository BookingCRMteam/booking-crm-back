import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '../src/db/schema/schema';
import citiesData from '../data/cities.json';
import { and, eq, ilike } from 'drizzle-orm';

dotenv.config({ path: '.env.development' });
interface CityTranslation {
  cityId: number;
  languageCode: string;
  name: string;
}
export async function seedCities() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });
  const { cities, cityTranslations } = schema;
  console.log('🚀 Starting city seeding...');
  console.log(
    'ℹ️ Note: This script prevents new duplicates but does not remove existing ones.',
  );

  for (const city of citiesData) {
    const cityNameEn = city.name_en?.trim();
    const countryIso = city.countryIso2?.trim().toUpperCase();
    if (!cityNameEn || !countryIso) {
      console.warn(
        `⚠️ Skipping city data with empty name or country: ${JSON.stringify(
          city,
        )}`,
      );
      continue;
    }

    try {
      const existing = await db
        .select({ id: cities.id })
        .from(cities)
        .leftJoin(cityTranslations, eq(cities.id, cityTranslations.cityId))
        .where(
          and(
            eq(cities.countryIso2, countryIso),
            eq(cityTranslations.languageCode, 'en'),
            ilike(cityTranslations.name, cityNameEn),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        console.log(
          `➡️ City "${cityNameEn}" in ${countryIso} already exists. Skipping.`,
        );
        continue;
      }

      console.log(
        `➕ City "${cityNameEn}" in ${countryIso} not found, adding.`,
      );
      const [insertedCity] = await db
        .insert(cities)
        .values({ countryIso2: countryIso })
        .returning({ id: cities.id });

      const cityId = insertedCity.id;
      const translationsToInsert: CityTranslation[] = [];
      translationsToInsert.push({
        cityId,
        languageCode: 'en',
        name: cityNameEn,
      });

      const cityNameUk = city.name_uk?.trim();
      if (cityNameUk) {
        translationsToInsert.push({
          cityId,
          languageCode: 'uk',
          name: cityNameUk,
        });
      }
      if (translationsToInsert.length > 0) {
        await db.insert(cityTranslations).values(translationsToInsert);
      }

      console.log(`🌱 Seeded city "${cityNameEn}" in ${countryIso}.`);
    } catch (error) {
      console.error(`❌ Error seeding city "${cityNameEn}":`, error);
    }
  }

  console.log('✅ Cities seeding finished.');
  await pool.end();
}

seedCities().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
