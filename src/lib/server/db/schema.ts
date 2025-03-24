import { sql } from 'drizzle-orm';
import { pgTable as table, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = table('users', {
  uuid: uuid('uuid').notNull().primaryKey().defaultRandom(),
  number: varchar('number', { length: 9 }).default(sql`NULL`),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull()
});

export const session = table('sessions', {
  id: text('id').notNull().primaryKey(),
  userUuid: uuid('user_uuid')
    .notNull()
    .references(() => user.uuid),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
