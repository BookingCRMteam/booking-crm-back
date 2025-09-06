import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema/schema';
import * as countriesLib from 'i18n-iso-countries';

// підключаємо локалі
import enLocale from 'i18n-iso-countries/langs/en.json';
import ukLocale from 'i18n-iso-countries/langs/uk.json';

countriesLib.registerLocale(enLocale);
countriesLib.registerLocale(ukLocale);

export async function seedCountries() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  const { countries, countryTranslations } = schema;
  const allCountries = countriesLib.getAlpha2Codes();

  for (const [iso2] of Object.entries(allCountries)) {
    const iso3 = countriesLib.alpha2ToAlpha3(iso2);

    // вставляємо країну
    await db
      .insert(countries)
      .values({
        iso2,
        iso3,
      })
      .onConflictDoNothing();

    // переклади
    const enName = countriesLib.getName(iso2, 'en');
    const ukName = countriesLib.getName(iso2, 'uk');

    if (enName) {
      await db
        .insert(countryTranslations)
        .values({
          countryIso2: iso2,
          languageCode: 'en',
          name: enName,
        })
        .onConflictDoNothing();
    }

    if (ukName) {
      await db
        .insert(countryTranslations)
        .values({
          countryIso2: iso2,
          languageCode: 'uk',
          name: ukName,
        })
        .onConflictDoNothing();
    }
  }

  console.log('✅ Countries seeded');
}
