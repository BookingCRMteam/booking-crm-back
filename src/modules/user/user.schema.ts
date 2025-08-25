import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  sub: text('sub').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  operatorId: integer('operator_id'),
  firstPersonName: text('first_person_name'),
  firstPersonSurame: text('first_person_surame'),
  secondPersonName: text('second_person_name'),
  secondPersonSurame: text('second_person_surame'),
  phone: text('phone'),
  role: text('role').default('traveler').notNull(),
});
