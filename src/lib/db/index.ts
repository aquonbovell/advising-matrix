const tenant = import.meta.env.VITE_TENANT;
import { Kysely, type RawBuilder, sql, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import { DATABASE_URL } from '$env/static/private';
import type { DB } from './schema';

const postgresql = new Pool({
	connectionString: DATABASE_URL,
	ssl: {
		rejectUnauthorized: false
	}
});

// Ensure the search path is set correctly for the schema
postgresql.on('connect', (client) => {
	client.query(`SET search_path TO ${tenant}, public;`);
});

export { postgresql };

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: postgresql
	})
}).withSchema(tenant);

export function json<T>(obj: T): RawBuilder<T> {
	return sql`${JSON.stringify(obj)}`;
}
