import { users } from '@app/db/schema/schema';
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const operators = pgTable('operators', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  companyName: text('company_name').notNull(),
  description: text('description').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  website: text('website').notNull(),
  countryCode: text('country_code'), // <-- нове поле
  phoneNumber: text('phone_number'),
  status: text('status').default('pending').notNull(),
  philosophy: text('philosophy'),
  photo: text('photo'),
});
