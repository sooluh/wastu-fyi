import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { decodeIdToken } from 'arctic';
import { google } from '$lib/server/oauth';
import type { OAuth2Tokens } from 'arctic';
import type { RequestEvent } from './$types';
import * as schema from '$lib/server/db/schema';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/session';

export async function GET(event: RequestEvent): Promise<Response> {
  const storedState = event.cookies.get('google_oauth_state') ?? null;
  const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
  const code = event.url.searchParams.get('code');
  const state = event.url.searchParams.get('state');

  if (storedState === null || codeVerifier === null || code === null || state === null) {
    return new Response('Please restart the process.', {
      status: 400
    });
  }

  if (storedState !== state) {
    return new Response('Please restart the process.', {
      status: 400
    });
  }

  let tokens: OAuth2Tokens;

  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    return new Response('Please restart the process.', {
      status: 400
    });
  }

  const claims = decodeIdToken(tokens.idToken());
  const claimsParser = new ObjectParser(claims);

  const googleId = claimsParser.getString('sub');
  const name = claimsParser.getString('name');
  const avatar = claimsParser.getString('picture');
  const email = claimsParser.getString('email');

  const existingUser = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.googleId, googleId))
    .then((row) => row.at(0));

  if (!!existingUser) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.uuid);

    setSessionTokenCookie(event, sessionToken, session.expiresAt);

    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  const user = await db.insert(schema.user).values({ googleId, email, name, avatar }).returning();
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user[0].uuid);

  setSessionTokenCookie(event, sessionToken, session.expiresAt);

  return new Response(null, {
    status: 302,
    headers: { Location: '/' }
  });
}
