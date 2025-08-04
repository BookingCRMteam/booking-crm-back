// src/schema/cities.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core'; // <-- ДОДАЙТЕ uniqueIndex
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
  // ВИКОРИСТОВУЙТЕ uniqueIndex ДЛЯ СКЛАДЕНОГО УНІКАЛЬНОГО ІНДЕКСУ
  (table) => ({
    nameCountryUnique: uniqueIndex('name_country_unique_idx').on(
      table.name,
      table.countryId,
    ), // <-- Ось тут зміна!
  }),
);

export const cityRelations = relations(cities, ({ one, many }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  toursAsDestination: many(tours, { relationName: 'destinationCity' }), // Поверніть на більш унікальні назви
  toursAsDeparture: many(tours, { relationName: 'departureCity' }), // Щоб уникнути конфліктів, як ми обговорювали раніше
}));
