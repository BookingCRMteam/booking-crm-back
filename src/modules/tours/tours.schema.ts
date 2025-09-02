import { countryCodeEnum } from '@app/db/schema/enums/country-code.enum';
import { relations } from 'drizzle-orm';
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
} from 'drizzle-orm/pg-core';
import { operators } from '../operator/operator.schema';

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
  countryISO2Code: countryCodeEnum('country_iso2_code').notNull().default('UA'),
  cityId: integer('city_id'),
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
  departureCityId: integer('departure_city_id'),
  departureCountryISO2Code: countryCodeEnum('departure_country_iso2_code'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tourPhotos = pgTable('tour_photos', {
  id: serial('id').primaryKey(),
  tourId: integer('tour_id')
    .references(() => tours.id, { onDelete: 'cascade' })
    .notNull(),
  url: varchar('url', { length: 255 }).unique().notNull(),
});

export const toursRelations = relations(tours, ({ one, many }) => ({
  operator: one(operators, {
    fields: [tours.operatorId],
    references: [operators.id],
  }),
  photos: many(tourPhotos),
  // reviews: many(reviews),
  // bookings: many(bookings),
}));

export const tourPhotosRelations = relations(tourPhotos, ({ one }) => ({
  tour: one(tours, {
    fields: [tourPhotos.tourId],
    references: [tours.id],
  }),
}));
