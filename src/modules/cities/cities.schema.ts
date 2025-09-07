// src/schema/cities.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  char,
  unique,
} from 'drizzle-orm/pg-core';
import { countries } from '../countries/countries.schema';
import { relations } from 'drizzle-orm';

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  countryIso2: char('country_iso2', { length: 2 })
    .notNull()
    .references(() => countries.iso2, { onDelete: 'cascade' }),
});

export const cityTranslations = pgTable(
  'city_translations',
  {
    id: serial('id').primaryKey(),
    cityId: integer('city_id')
      .notNull()
      .references(() => cities.id, { onDelete: 'cascade' }),
    languageCode: varchar('language_code', { length: 5 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
  },
  (t) => ({
    uniq: unique().on(t.cityId, t.languageCode),
  }),
);

export const citiesRelations = relations(cities, ({ one, many }) => ({
  country: one(countries, {
    fields: [cities.countryIso2],
    references: [countries.iso2],
  }),
  translations: many(cityTranslations, {
    relationName: 'city_translations',
  }),
}));

export const cityTranslationsRelations = relations(
  cityTranslations,
  ({ one }) => ({
    city: one(cities, {
      fields: [cityTranslations.cityId],
      references: [cities.id],
      relationName: 'city_translations',
    }),
  }),
);
