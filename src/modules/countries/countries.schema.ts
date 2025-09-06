import { char, pgTable, serial, unique, varchar } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  iso2: char('iso2', { length: 2 }).notNull().unique(),
  iso3: char('iso3', { length: 3 }).notNull().unique(),
});

export const countryTranslations = pgTable(
  'country_translations',
  {
    id: serial('id').primaryKey(),
    countryIso2: char('country_iso2', { length: 2 })
      .notNull()
      .references(() => countries.iso2, { onDelete: 'cascade' }),
    languageCode: varchar('language_code', { length: 5 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
  },
  (t) => ({
    uniq: unique().on(t.countryIso2, t.languageCode),
  }),
);
