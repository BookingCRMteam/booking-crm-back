// src/schema/cities.ts
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { countries } from '../countries/countries.schema';

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  countryId: integer('country_id')
    .notNull()
    .references(() => countries.id), // Зовнішній ключ до таблиці країн
});

export const citiesRelations = relations(cities, ({ one }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
}));
