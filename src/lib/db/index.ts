import { Kysely, type RawBuilder, sql, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import { DATABASE_URL } from '$env/static/private';
import type { DB } from './schema';

export const postgresql = new Pool({
	connectionString: DATABASE_URL
});

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: postgresql
	})
});

export function json<T>(obj: T): RawBuilder<T> {
	return sql`${JSON.stringify(obj)}`;
}
