import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tours } from '../tours/tours.schema';
import { users } from '../user/user.schema';

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'no action' }),
  tourId: integer('tour_id')
    .notNull()
    .references(() => tours.id),
  numberOfPeople: integer('number_of_people').notNull().default(1),
  status: varchar('status', { length: 50 })
    .notNull()
    .default('pending_payment'), // pending_payment, paid, confirmed, cancelled, failed
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paymentProvider: varchar('payment_provider', { length: 20 }), // stripe, liqpay
  paymentSessionId: varchar('payment_session_id', { length: 255 }), // Ідентифікатор сесії/платежу
});

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
