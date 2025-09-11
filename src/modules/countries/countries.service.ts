import { Inject, Injectable } from '@nestjs/common';
import * as schema from '@app/db/schema/schema';
import { and, eq, ilike } from 'drizzle-orm';
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
    const baseWhere = and(
      eq(countryTranslations.countryIso2, countries.iso2),
      eq(countryTranslations.languageCode, lang),
    );
    const whereClause = q?.trim()
      ? and(baseWhere, ilike(countryTranslations.name, `${q.trim()}%`))
      : baseWhere;

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
      .where(whereClause);

    return await allCountries;
  }
}
