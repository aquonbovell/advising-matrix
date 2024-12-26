import { dev } from '$app/environment';
import { Kysely } from 'kysely';
import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';
import type { DB } from './schema';
import { LibsqlDialect } from '@libsql/kysely-libsql';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');
// if (!dev && !env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');
if (!env.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not set');
if (!env.DEFAULT_PASSWORD) throw new Error('DEFAULT_PASSWORD is not set');
const client = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
export const db = new Kysely<DB>({
	dialect: new LibsqlDialect({ client })
});
