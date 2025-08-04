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
import { cities } from '../cities/cities.schema';
import { countries } from '../countries/countries.schema';

export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  operatorId: integer('operator_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),

  // Тепер використовуємо зовнішні ключі до таблиць countries та cities
  countryId: integer('country_id')
    .notNull()
    .references(() => countries.id),
  cityId: integer('city_id').references(() => cities.id), // Місто може бути необов'язковим

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

  // Місто та країна виїзду також можуть бути посиланнями
  departureCityId: integer('departure_city_id').references(() => cities.id),
  departureCountryId: integer('departure_country_id').references(
    () => countries.id,
  ),
});

export const tourPhotos = pgTable('tour_photos', {
  id: serial('id').primaryKey(),
  tourId: integer('tour_id').notNull(),
  url: varchar('url', { length: 255 }).unique().notNull(),
});

export const toursRelations = relations(tours, ({ one, many }) => ({
  country: one(countries, {
    fields: [tours.countryId],
    references: [countries.id],
    relationName: 'destinationCountry',
  }),
  city: one(cities, {
    fields: [tours.cityId],
    references: [cities.id],
    relationName: 'destinationCity', // Додаємо ім'я відношення для кращої читабельності
  }),
  departureCity: one(cities, {
    fields: [tours.departureCityId],
    references: [cities.id],
    relationName: 'departureCity',
  }),
  departureCountry: one(countries, {
    fields: [tours.departureCountryId],
    references: [countries.id],
    relationName: 'departureCountry',
  }),
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
