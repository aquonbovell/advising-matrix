import { Kysely, type RawBuilder, sql, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DATABASE_URL } from '$env/static/private';
import type { DB } from './schema';

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: DATABASE_URL
		})
	})
});

export function json<T>(obj: T): RawBuilder<T> {
	return sql`${JSON.stringify(obj)}`;
}
