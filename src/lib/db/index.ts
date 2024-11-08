import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import type { DB } from './schema';
import 'dotenv/config';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined');
}

const postgresql = new Pool({
	connectionString: DATABASE_URL,
	max: 20,
	idleTimeoutMillis: 3000,
	connectionTimeoutMillis: 20000
});

export { postgresql };

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: postgresql
	})
});
