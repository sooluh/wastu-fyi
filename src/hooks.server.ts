import type { Handle } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages';
import { sequence } from '@sveltejs/kit/hooks';
import * as session from '$lib/server/session';
import { TokenBucket } from '$lib/server/rate-limit';
import { paraglideMiddleware } from '$lib/paraglide/server';

const bucket = new TokenBucket<string>(100, 1);

const rateLimitHandle: Handle = ({ event, resolve }) => {
  const clientIP = event.request.headers.get('X-Forwarded-For');

  if (clientIP === null) {
    return resolve(event);
  }

  let cost: number;

  if (event.request.method === 'GET' || event.request.method === 'OPTIONS') {
    cost = 1;
  } else {
    cost = 3;
  }

  if (!bucket.consume(clientIP, cost)) {
    return new Response(m.too_many_requests(), { status: 429 });
  }

  return resolve(event);
};

const paraglideHandle: Handle = ({ event, resolve }) => {
  return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
    event.request = localizedRequest;

    return resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('%paraglide.lang%', locale);
      }
    });
  });
};

const authHandle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session') ?? null;

  if (token === null) {
    event.locals.user = null;
    event.locals.session = null;

    return resolve(event);
  }

  const { session: data, user } = await session.validateSessionToken(token);

  if (data !== null) {
    session.setSessionTokenCookie(event, token, data.expiresAt);
  } else {
    session.deleteSessionTokenCookie(event);
  }

  event.locals.session = data;
  event.locals.user = user;

  return resolve(event);
};

export const handle: Handle = sequence(rateLimitHandle, paraglideHandle, authHandle);
