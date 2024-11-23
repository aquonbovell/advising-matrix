import { Kysely } from 'kysely';
import { createClient } from '@libsql/client';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import { env } from '$env/dynamic/private';
import type { DB } from './schema';

if (!env.TURSO_AUTH_TOKEN) throw new Error('TURSO_AUTH_TOKEN is not set');
if (!env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not set');

// const client = createClient({ url: env.TURSO_DATABASE_URL });

export const db = new Kysely<DB>({
	dialect: new LibsqlDialect({
		url: env.TURSO_DATABASE_URL,
		syncUrl: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN,
		syncInterval: 60000
	})
});
