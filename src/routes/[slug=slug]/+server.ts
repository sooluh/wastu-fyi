import { db } from '$lib/server/db';
import type { RequestEvent } from './$types';
import { and, eq, isNull } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import * as schema from '$lib/server/db/schema';

export async function GET(event: RequestEvent): Promise<Response> {
  const link = await db
    .select()
    .from(schema.link)
    .where(and(eq(schema.link.slug, event.params.slug), isNull(schema.link.deletedAt)));

  if (link.length <= 0) {
    error(404, 'Not Found');
  }

  await db.insert(schema.click).values({ linkId: link[0].uuid });
  throw redirect(302, link[0].url);
}
