import { db } from '$lib/server/db';
import { count, eq } from 'drizzle-orm';
import { m } from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import * as schema from '$lib/server/db/schema';
import { generateCode, isValidUrl } from '$lib/utils';
import type { Actions, RequestEvent } from './$types';
import { setFlash } from 'sveltekit-flash-message/server';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';

export async function load(event: RequestEvent) {
  if (event.locals.session === null || event.locals.user === null) {
    return redirect(302, '/login');
  }

  const links = await db
    .select({
      uuid: schema.link.uuid,
      userId: schema.link.userId,
      slug: schema.link.slug,
      url: schema.link.url,
      createdAt: schema.link.createdAt,
      updatedAt: schema.link.updatedAt,
      clicks: count(schema.click)
    })
    .from(schema.link)
    .leftJoin(schema.click, eq(schema.click.linkId, schema.link.uuid))
    .groupBy(schema.link.uuid)
    .where(eq(schema.link.userId, event.locals.user.uuid));

  return { user: event.locals.user, links };
}

async function create(event: RequestEvent) {
  if (event.locals.session === null) {
    setFlash({ type: 'error', message: m.unauthorized() }, event.cookies);
    return fail(401);
  }

  const formData = await event.request.formData();
  const url = formData.get('url') as string;

  let slug = formData.get('slug') as string | null;

  if (!url) {
    setFlash({ type: 'error', message: m.destination_url_is_required() }, event.cookies);
    return fail(400);
  }

  if (!isValidUrl(url)) {
    setFlash({ type: 'error', message: m.destination_url_is_not_valid() }, event.cookies);
    return fail(400);
  }

  if (!slug) {
    slug = generateCode();
  }

  const exists = await db
    .select()
    .from(schema.link)
    .where(eq(schema.link.slug, slug))
    .then((row) => row.at(0));

  if (!!exists) {
    setFlash({ type: 'error', message: m.the_slug_has_been_taken_try_again() }, event.cookies);
    return fail(400);
  }

  try {
    const uuid = await db
      .insert(schema.link)
      .values({ userId: event.locals.user.uuid, slug, url })
      .returning({ uuid: schema.link.uuid });

    return { success: true, uuid: uuid[0].uuid, slug };
  } catch (e) {
    console.error(e);

    setFlash({ type: 'error', message: m.failed_to_create_short_link() }, event.cookies);
    return fail(500);
  }
}

async function logout(event: RequestEvent) {
  if (event.locals.session === null) {
    return fail(401);
  }

  await invalidateSession(event.locals.session.id);
  deleteSessionTokenCookie(event);

  return redirect(302, '/login');
}

export const actions: Actions = { create, logout };
