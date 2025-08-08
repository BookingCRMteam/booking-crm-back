import { users } from '@app/db/schema';
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const operators = pgTable('operators', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  companyName: text('company_name').notNull(),
  description: text('description').notNull(),
  contactPerson: text('contact_person').notNull(),
  website: text('website').notNull(),
  phone: text('phone').notNull(),
});
