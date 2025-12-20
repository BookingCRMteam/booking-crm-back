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

  let updatedCount = 0;
  let skippedCount = 0;

  await db.transaction(async (tx) => {
    for (const tour of toursToUpdate) {
      const city = tour.cityRelation;
      const country = tour.countryRelation;

      // Skip tours that lack relation data
      if (!city && !country) {
        console.log(
          `Skipping tour ${tour.id}: both cityRelation and countryRelation are null/undefined`,
        );
        skippedCount++;
        continue;
      }

      // Build the update payload dynamically
      const updatePayload: {
        city?: typeof city;
        country?: typeof country;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (city) {
        updatePayload.city = city;
      } else {
        console.log(
          `Tour ${tour.id}: cityRelation is null, skipping city update`,
        );
      }

      if (country) {
        updatePayload.country = country;
      } else {
        console.log(
          `Tour ${tour.id}: countryRelation is null, skipping country update`,
        );
      }

      console.log(`Updating tour ${tour.id}...`);
      await tx
        .update(schema.tours)
        .set(updatePayload)
        .where(eq(schema.tours.id, tour.id));

      updatedCount++;
    }
  });

  console.log('Backfill complete.');
  console.log(`Updated: ${updatedCount} tours`);
  console.log(`Skipped: ${skippedCount} tours`);
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error during backfill:', err);
  process.exit(1);
});
