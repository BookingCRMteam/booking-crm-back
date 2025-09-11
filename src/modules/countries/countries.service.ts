import { Inject, Injectable } from '@nestjs/common';
import * as schema from '@app/db/schema/schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class CountriesService {
  constructor(
    // Правильний спосіб ін'єкції Drizzle DB в NestJS
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>, // <-- Типізуйте db згідно з вашою основною схемою
  ) {}
  async getCountries(lang: string, q: string = '') {
    const { countries, countryTranslations } = schema;
    const allCountries = this.db
      .select({
        iso2: countries.iso2,
        name: countryTranslations.name,
      })
      .from(countries)
      .leftJoin(
        countryTranslations,
        eq(countryTranslations.countryIso2, countries.iso2),
      )
      .where(eq(countryTranslations.languageCode, lang));

    if (q) {
      try {
        return (await allCountries).filter((country) =>
          country.name.toLowerCase().startsWith(q.toLowerCase()),
        );
      } catch (error) {
        console.error('Error filtering countries:', error);
      }
    }

    return await allCountries;
  }
}
