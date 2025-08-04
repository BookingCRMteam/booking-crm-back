// src/schema/cities.ts
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { countries } from '../countries/countries.schema';
import { tours } from '../tours/tours.schema';

export const cities = pgTable(
  'cities',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countries.id), // Зовнішній ключ до таблиці країн
  },
  (table) => ({
    // Додайте другий аргумент для індексів
    nameCountryUnique: {
      columns: [table.name, table.countryId], // Використовуйте table.name, table.countryId
      unique: true,
    },
  }),
);

export const cityRelations = relations(cities, ({ one, many }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  toursAsDestination: many(tours, { relationName: 'destinationCity' }),
  toursAsDeparture: many(tours, { relationName: 'departureCity' }),
}));
