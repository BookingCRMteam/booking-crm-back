import { Inject, Injectable } from '@nestjs/common';
import * as schema from '@app/db/schema/schema';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class CitiesService {
  constructor(
    // Правильний спосіб ін'єкції Drizzle DB в NestJS
    @Inject('DRIZZLE_CLIENT')
    private db: NodePgDatabase<typeof schema>, // <-- Типізуйте db згідно з вашою основною схемою
  ) {}
  async getCities(countryIso2: string, lang: string) {
    const { cities, cityTranslations } = schema;
    return await this.db
      .select({
        id: cities.id,
        name: cityTranslations.name,
      })
      .from(cities)
      .leftJoin(cityTranslations, eq(cityTranslations.cityId, cities.id))
      .where(
        and(
          eq(cities.countryIso2, countryIso2),
          eq(cityTranslations.languageCode, lang),
        ),
      );
  }
}
