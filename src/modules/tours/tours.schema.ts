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
} from 'drizzle-orm/pg-core';
import { operators } from '../operator/operator.schema';
import { countries } from '../countries/countries.schema';
import { cities } from '../cities/cities.schema';

export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  operatorId: integer('operator_id')
    .references(() => operators.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  countryISO2Code: char('country_iso2_code', { length: 2 })
    .notNull()
    .references(() => countries.iso2, { onUpdate: 'cascade' }),
  cityId: integer('city_id').references(() => cities.id, {
    onUpdate: 'cascade',
  }),
  type: varchar('type', { length: 100 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('UAH'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  availableSpots: integer('available_spots').notNull(),
  conditions: text('conditions'),
  isActive: boolean('is_active').default(true),
  adults: integer('adults').default(1).notNull(),
  children: integer('children').default(0).notNull(),
  petsAllowed: boolean('pets_allowed').default(false).notNull(),
  departureCityId: integer('departure_city_id').references(() => cities.id, {
    onUpdate: 'cascade',
  }),
  departureCountryISO2Code: char('departure_country_iso2_code', {
    length: 2,
  }).references(() => countries.iso2, { onUpdate: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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
  (table) => {
    return {
      mainPhotoIdx: uniqueIndex('main_photo_idx')
        .on(table.tourId)
        .where(sql`"is_main" = true`),
    };
  },
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
  departureCity: one(cities, {
    fields: [tours.departureCityId],
    references: [cities.id],
  }),
}));

export const tourPhotosRelations = relations(tourPhotos, ({ one }) => ({
  tour: one(tours, {
    fields: [tourPhotos.tourId],
    references: [tours.id],
  }),
}));
