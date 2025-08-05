import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { cities } from '../cities/cities.schema';
import { tours } from '../tours/tours.schema';

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // Назва країни, має бути унікальною
});
export const countryRelations = relations(countries, ({ many }) => ({
  cities: many(cities), // Країна може мати багато міст
  toursAsDestination: many(tours, { relationName: 'destinationCountry' }), // Тури, де країна є призначенням
  toursAsDeparture: many(tours, { relationName: 'departureCountry' }), // Тури, де країна є відправленням
}));
