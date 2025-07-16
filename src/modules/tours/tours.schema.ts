import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  operatorId: integer('operator_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  country: varchar('country', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }),
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
});

export const tourPhotos = pgTable('tour_photos', {
  id: serial('id').primaryKey(),
  tourId: integer('tour_id').notNull(),
  url: varchar('url', { length: 255 }).unique().notNull(),
  description: text('description'),
  isMain: boolean('is_main').default(false),
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
