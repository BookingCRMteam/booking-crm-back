import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  char,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { operators } from '../operator/operator.schema';
import { countries } from '../countries/countries.schema';
import { cities } from '../cities/cities.schema';

export const tours = pgTable(
  'tours',
  {
    id: serial('id').primaryKey(),
    operatorId: integer('operator_id')
      .references(() => operators.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      })
      .notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description'),
    countryISO2Code: char('country_iso2_code', { length: 2 })
      .notNull()
      .references(() => countries.iso2, { onUpdate: 'cascade' }),
    cityId: integer('city_id')
      .references(() => cities.id, {
        onUpdate: 'cascade',
      })
      .notNull(),
    type: varchar('type', { length: 100 }),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('UAH'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    availableSpots: integer('available_spots').notNull(),
    bookedSpots: integer('booked_spots').default(0),
    totalSpots: integer('total_spots').generatedAlwaysAs(
      sql`"available_spots" + COALESCE("booked_spots", 0)`,
    ),
    conditions: text('conditions'),
    isActive: boolean('is_active').default(true),
    isFeatured: boolean('is_featured').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  () => [
    check(
      'available_spots_check',
      sql`"available_spots" >= 0 AND "available_spots" <= 100 AND "available_spots" % 2 = 0`,
    ),
    check('price_check', sql`"price" >= 100 AND "price" <= 100000`),
    check('currency_check', sql`"currency" IN ('UAH', 'USD', 'EUR')`),
    check(
      'dates_check',
      sql`"start_date" > current_date and "end_date" > "start_date"`,
    ),
  ],
);

export const tourPhotos = pgTable(
  'tour_photos',
  {
    id: serial('id').primaryKey(),
    tourId: integer('tour_id')
      .references(() => tours.id, { onDelete: 'cascade' })
      .notNull(),
    url: varchar('url', { length: 255 }).notNull(),
    isMain: boolean('is_main').default(false).notNull(),
    description: text('description'),
  },
  (table) => [
    uniqueIndex('main_photo_idx')
      .on(table.tourId)
      .where(sql`"is_main" = true`),
  ],
);

export const toursRelations = relations(tours, ({ one, many }) => ({
  operator: one(operators, {
    fields: [tours.operatorId],
    references: [operators.id],
  }),
  photos: many(tourPhotos),
  country: one(countries, {
    fields: [tours.countryISO2Code],
    references: [countries.iso2],
  }),
  city: one(cities, {
    fields: [tours.cityId],
    references: [cities.id],
  }),
}));

export const tourPhotosRelations = relations(tourPhotos, ({ one }) => ({
  tour: one(tours, {
    fields: [tourPhotos.tourId],
    references: [tours.id],
  }),
}));
