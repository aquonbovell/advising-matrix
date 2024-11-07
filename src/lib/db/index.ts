import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import type { DB } from './schema';
import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL } = process.env;

const postgresql = new Pool({
	connectionString: DATABASE_URL,
	max: 20,
	idleTimeoutMillis: 3000,
	ssl: {
		rejectUnauthorized: true
	},
	connectionTimeoutMillis: 2000
});

export { postgresql };

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: postgresql
	})
});
