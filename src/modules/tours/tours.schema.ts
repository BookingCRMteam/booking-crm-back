import { countryCodeEnum } from '@app/db/enums/country-code.enum';
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

export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  operatorId: integer('operator_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  countryIso2Code: countryCodeEnum('country_iso2_code').notNull().default('UA'),

  // Тепер використовуємо зовнішні ключі до таблиць countries та cities
  cityId: integer('city_id'), // Місто може бути необов'язковим
  type: varchar('type', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('UAH'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  availableSpots: integer('available_spots').notNull(),
  conditions: text('conditions'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  adults: integer('adults').default(1).notNull(),
  children: integer('children').default(0).notNull(),
  petsAllowed: boolean('pets_allowed').default(false).notNull(),
  departureCityId: integer('departure_city_id'),
  departureCountryISO2Code: countryCodeEnum('departure_country_iso2_code'),
});

export const tourPhotos = pgTable('tour_photos', {
  id: serial('id').primaryKey(),
  tourId: integer('tour_id').notNull(),
  url: varchar('url', { length: 255 }).unique().notNull(),
});

export const toursRelations = relations(tours, ({ many }) => ({
  // operator: one(operators, {
  //   fields: [tours.operatorId],
  //   references: [operators.id],
  // }),
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
