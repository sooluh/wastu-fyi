import { db } from './db';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';
import { sha256 } from '@oslojs/crypto/sha2';
import type { RequestEvent } from '@sveltejs/kit';
import { encodeBase32, encodeHexLowerCase } from '@oslojs/encoding';

export const validateSessionToken = async (token: string): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const row = await db
    .select()
    .from(schema.session)
    .innerJoin(schema.user, eq(schema.session.userId, schema.user.uuid))
    .where(eq(schema.session.id, sessionId))
    .then((data) => data.at(0));

  if (row === null) {
    return { session: null, user: null };
  }

  const session: schema.Session = {
    id: row!.sessions.id,
    userId: row!.sessions.userId,
    expiresAt: row!.sessions.expiresAt
  };

  const user: schema.User = {
    uuid: row!.users.uuid,
    number: row!.users.number,
    googleId: row!.users.googleId,
    email: row!.users.email,
    name: row!.users.name,
    avatar: row!.users.avatar
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(schema.session).where(eq(schema.session.id, session.id));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await db
      .update(schema.session)
      .set({ expiresAt: session.expiresAt })
      .where(eq(schema.session.id, session.id));
  }

  return { session, user };
};

export const invalidateSession = async (sessionId: string) => {
  await db.delete(schema.session).where(eq(schema.session.id, sessionId));
};

export const invalidateUserSessions = async (userId: string) => {
  await db.delete(schema.session).where(eq(schema.session.userId, userId));
};

export const setSessionTokenCookie = (event: RequestEvent, token: string, expiresAt: Date) => {
  event.cookies.set('session', token, {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    expires: expiresAt
  });
};

export const deleteSessionTokenCookie = (event: RequestEvent) => {
  event.cookies.set('session', '', {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 0
  });
};

export const generateSessionToken = () => {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32(tokenBytes).toLowerCase();

  return token;
};

export const createSession = async (token: string, userId: string) => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const session: schema.Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  };

  await db.insert(schema.session).values({ id: sessionId, userId, expiresAt: session.expiresAt });

  return session;
};

type SessionValidationResult =
  | { session: schema.Session; user: schema.User }
  | { session: null; user: null };
