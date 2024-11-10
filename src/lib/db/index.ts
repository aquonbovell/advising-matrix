import { LibsqlDialect } from '@libsql/kysely-libsql';
import { createClient } from '@libsql/client';
import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from './schema';
import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const { DATABASE_URL, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined');
}

if (!TURSO_DATABASE_URL) {
	throw new Error('TURSO_DATABASE_URL is not defined');
}

if (!TURSO_AUTH_TOKEN) {
	throw new Error('TURSO_AUTH_TOKEN is not defined');
}

export const client = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
});

const postgresql = new Pool({
	connectionString: DATABASE_URL,
	max: 20,
	idleTimeoutMillis: 3000,
	connectionTimeoutMillis: 20000
});

export { postgresql };

// export const db = new Kysely<DB>({
// 	dialect: new LibsqlDialect({
// 		client
// 	})
// });

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: postgresql
	})
});
