import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  sub: text('sub').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  operatorId: integer('operator_id'),
  passwordHash: text('password_hash'),
  firstName: text('firstName'),
  lastName: text('lastName'),
  phone: text('phone'),
  role: text('role').default('traveler').notNull(),
});
