import { sql } from 'drizzle-orm';
import * as t from 'drizzle-orm/pg-core';
import { pgTable as table } from 'drizzle-orm/pg-core';

export const user = table('users', {
  uuid: t.uuid('uuid').notNull().primaryKey().defaultRandom(),
  number: t.varchar('number', { length: 9 }).default(sql`NULL`),
  googleId: t.text('google_id').notNull().unique(),
  email: t.text('email').notNull().unique(),
  name: t.text('name').notNull(),
  avatar: t.text('avatar').notNull()
});

export const session = table('sessions', {
  id: t.text('id').notNull().primaryKey(),
  userId: t
    .uuid('user_uuid')
    .notNull()
    .references(() => user.uuid),
  expiresAt: t.timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const link = table('links', {
  uuid: t.uuid('uuid').notNull().primaryKey().defaultRandom(),
  userId: t
    .uuid('user_uuid')
    .notNull()
    .references(() => user.uuid),
  slug: t.varchar('slug', { length: 255 }).notNull().unique(),
  url: t.text('url').notNull(),
  createdAt: t.timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: t
    .timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .default(sql`NULL`)
    .$onUpdate(() => new Date())
});

export const click = table('clicks', {
  uuid: t.uuid('uuid').notNull().primaryKey().defaultRandom(),
  linkId: t
    .uuid('link_uuid')
    .notNull()
    .references(() => link.uuid),
  createdAt: t.timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Link = typeof link.$inferSelect;
export type Click = typeof click.$inferSelect;
