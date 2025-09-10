import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '../src/db/schema/schema';
import * as countriesLib from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import ukLocale from 'i18n-iso-countries/langs/uk.json';

dotenv.config({ path: '.env.development' });
interface CountryTranslation {
  countryIso2: string;
  languageCode: string;
  name: string;
}
countriesLib.registerLocale(enLocale as countriesLib.LocaleData);
countriesLib.registerLocale(ukLocale as countriesLib.LocaleData);

export async function seedCountries() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  const { countries, countryTranslations } = schema;
  const allCountryCodes = countriesLib.getAlpha2Codes();

  console.log('🚀 Starting country seeding...');

  for (const iso2 of Object.keys(allCountryCodes)) {
    const iso3 = countriesLib.alpha2ToAlpha3(iso2);

    if (!iso3) {
      console.warn(`⚠️ Could not find ISO3 for ISO2: ${iso2}. Skipping.`);
      continue;
    }

    try {
      await db.transaction(async (tx) => {
        await tx.insert(countries).values({ iso2, iso3 }).onConflictDoNothing();

        const enName = countriesLib.getName(iso2, 'en');
        const ukName = countriesLib.getName(iso2, 'uk');

        const translationsToInsert: CountryTranslation[] = [];
        if (enName) {
          translationsToInsert.push({
            countryIso2: iso2,
            languageCode: 'en',
            name: enName,
          });
        }
        if (ukName) {
          translationsToInsert.push({
            countryIso2: iso2,
            languageCode: 'uk',
            name: ukName,
          });
        }

        if (translationsToInsert.length > 0) {
          await tx
            .insert(countryTranslations)
            .values(translationsToInsert)
            .onConflictDoNothing();
        }
      });
      console.log(`🌱 Seeded country: ${iso2}`);
    } catch (error) {
      console.error(`❌ Error seeding country ${iso2}:`, error);
    }
  }

  console.log('✅ Countries seeding finished.');
  await pool.end();
}

seedCountries().catch((err) => {
  console.error('❌ Seeding countries failed:', err);
  process.exit(1);
});
