// src/schema/cities.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  char,
  unique,
} from 'drizzle-orm/pg-core'; // <-- ДОДАЙТЕ uniqueIndex
import { countries } from '../countries/countries.schema';

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
