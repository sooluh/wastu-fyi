import { db } from '$lib/server/db';
import { m } from '$lib/paraglide/messages';
import { fail, redirect } from '@sveltejs/kit';
import * as schema from '$lib/server/db/schema';
import { and, count, eq, isNull } from 'drizzle-orm';
import type { Actions, RequestEvent } from './$types';
import { setFlash } from 'sveltekit-flash-message/server';
import { generateCode, isValidSlug, isValidUrl } from '$lib/utils';
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
      deletedAt: schema.link.deletedAt,
      clicks: count(schema.click)
    })
    .from(schema.link)
    .leftJoin(schema.click, eq(schema.click.linkId, schema.link.uuid))
    .groupBy(schema.link.uuid)
    .where(and(eq(schema.link.userId, event.locals.user.uuid), isNull(schema.link.deletedAt)));

  return { user: event.locals.user, links };
}

async function create(event: RequestEvent) {
  if (event.locals.session === null) {
    setFlash({ type: 'error', message: m.unauthorized() }, event.cookies);
    return fail(401);
  }

  const formData = await event.request.formData();
  const url = formData.get('url') as string;
  const slug = formData.get('slug') as string | null;

  if (!url) {
    setFlash({ type: 'error', message: m.destination_url_is_required() }, event.cookies);
    return fail(400);
  }

  if (!isValidUrl(url)) {
    setFlash({ type: 'error', message: m.destination_url_is_not_valid() }, event.cookies);
    return fail(400);
  }

  if (!!slug) {
    if (!isValidSlug(slug)) {
      setFlash({ type: 'error', message: m.short_link_is_not_valid() }, event.cookies);
      return fail(400);
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
  }

  try {
    await db
      .insert(schema.link)
      .values({ userId: event.locals.user.uuid, slug: slug || generateCode(), url })
      .returning({ uuid: schema.link.uuid });

    setFlash({ type: 'success', message: m.successfully_create_a_short_link() }, event.cookies);
    return {};
  } catch (e) {
    console.error(e);

    setFlash({ type: 'error', message: m.failed_to_create_short_link() }, event.cookies);
    return fail(500);
  }
}

async function unlist(event: RequestEvent) {
  if (event.locals.session === null) {
    return fail(401);
  }

  const formData = await event.request.formData();
  const uuid = formData.get('uuid') as string;

  const exists = await db
    .select()
    .from(schema.link)
    .where(eq(schema.link.uuid, uuid))
    .then((row) => row.at(0));

  if (!exists) {
    setFlash({ type: 'error', message: m.short_link_cannot_be_found() }, event.cookies);
    return fail(404);
  }

  try {
    const unlist = await db
      .update(schema.link)
      .set({ slug: generateCode(), deletedAt: new Date() })
      .where(eq(schema.link.uuid, uuid))
      .returning({ uuid: schema.link.uuid })
      .then((row) => row.at(0));

    if (!unlist) {
      throw new Error();
    }

    setFlash({ type: 'success', message: m.successfully_unlisted_a_short_link() }, event.cookies);
    return {};
  } catch (e) {
    console.error(e);

    setFlash({ type: 'error', message: m.failed_to_unlist_short_link() }, event.cookies);
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

export const actions: Actions = { create, unlist, logout };
