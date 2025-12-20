import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

import * as schema from '../src/db/schema/schema';
import { eq, isNull, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get<NodePgDatabase<typeof schema>>('DRIZZLE_CLIENT');

  console.log('Starting backfill of tour locations...');

  const toursToUpdate = await db.query.tours.findMany({
    where: or(isNull(schema.tours.city), isNull(schema.tours.country)),
    with: {
      cityRelation: { with: { translations: true } },
      countryRelation: { with: { translations: true } },
    },
  });

  console.log(`Found ${toursToUpdate.length} tours to update.`);

  for (const tour of toursToUpdate) {
    console.log(`Updating tour ${tour.id}...`);

    const city = tour.cityRelation;
    const country = tour.countryRelation;

    await db
      .update(schema.tours)
      .set({
        city: city,
        country: country,
        updatedAt: new Date(),
      })
      .where(eq(schema.tours.id, tour.id));
  }

  console.log('Backfill complete.');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error during backfill:', err);
  process.exit(1);
});
