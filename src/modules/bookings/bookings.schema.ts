import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  decimal,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { tours } from '../tours/tours.schema';
import { users } from '../user/user.schema';

export const bookings = pgTable(
  'bookings',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'no action',
      }),
    tourId: integer('tour_id')
      .notNull()
      .references(() => tours.id),
    numberOfPeople: integer('number_of_people').notNull().default(1),
    firstPersonName: varchar('first_person_name', { length: 255 }).notNull(),
    firstPersonSurname: varchar('first_person_surname', {
      length: 255,
    }).notNull(),
    secondPersonName: varchar('second_person_name', { length: 255 }).notNull(),
    secondPersonSurname: varchar('second_person_surname', {
      length: 255,
    }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    status: varchar('status', { length: 50 })
      .notNull()
      .default('pending_payment'),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    paymentProvider: varchar('payment_provider', { length: 20 }),
    paymentSessionId: varchar('payment_session_id', { length: 255 }),
  },
  (table) => ({
    uniqueCoupleTour: uniqueIndex('unique_couple_tour_active')
      .on(
        table.tourId,
        table.firstPersonName,
        table.firstPersonSurname,
        table.secondPersonName,
        table.secondPersonSurname,
      )
      .where(sql`status IN ('confirmed', 'pending_payment')`),
  }),
);

export const bookingRelations = relations(bookings, ({ one }) => ({
  tour: one(tours, {
    fields: [bookings.tourId],
    references: [tours.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));
