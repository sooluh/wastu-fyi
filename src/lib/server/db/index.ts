import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/postgres-js';

if (!env.SUPABASE_URL) throw new Error('SUPABASE_URL is not set');

const client = postgres(env.SUPABASE_URL);
export const db = drizzle(client, { schema });
