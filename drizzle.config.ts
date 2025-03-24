import { defineConfig } from 'drizzle-kit';

if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL is not set');

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  dbCredentials: { url: process.env.SUPABASE_URL },
  verbose: true,
  strict: true,
  dialect: 'postgresql'
});
