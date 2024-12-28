import { Kysely } from 'kysely';
import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';
import type { DB } from './schema';
import type { DB as APP_DB } from './app.schema';
import { LibsqlDialect } from '@libsql/kysely-libsql';
if (!env.AUTH_DATABASE_URL) throw new Error('AUTH_DATABASE_URL is not set');
if (!env.AUTH_DATABASE_AUTH_TOKEN) throw new Error('AUTH_DATABASE_AUTH_TOKEN is not set');
if (!env.APP_DATABASE_URL) throw new Error('APP_DATABASE_URL is not set');
if (!env.APP_DATABASE_AUTH_TOKEN) throw new Error('APP_DATABASE_AUTH_TOKEN is not set');
if (!env.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not set');
if (!env.DEFAULT_PASSWORD) throw new Error('DEFAULT_PASSWORD is not set');

const authClient = createClient({
	url: env.AUTH_DATABASE_URL,
	authToken: env.AUTH_DATABASE_AUTH_TOKEN
});

const client = createClient({
	url: env.APP_DATABASE_URL,
	authToken: env.APP_DATABASE_AUTH_TOKEN
});

export const authdb = new Kysely<DB>({
	dialect: new LibsqlDialect({ client: authClient })
});

export const db = new Kysely<APP_DB>({
	dialect: new LibsqlDialect({ client })
});
