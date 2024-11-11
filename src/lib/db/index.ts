import { Kysely, type RawBuilder, sql } from 'kysely';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import type { DB } from './schema';
import { dev } from '$app/environment';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';
import { createClient } from '@libsql/client';

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
	if (dev) {
		throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
	} else {
		console.warn('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
	}
}

export const dbClient = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
});

export const db = new Kysely<DB>({
	dialect: new LibsqlDialect({ client: dbClient })
});

export function json<T>(obj: T): RawBuilder<T> {
	return sql`${JSON.stringify(obj)}`;
}

// const { DATABASE_URL, CA, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

// if (!DATABASE_URL || !CA || !DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
// 	throw new Error('Missing environment variables');
// }

// const config = {
// 	user: DB_USER,
// 	password: DB_PASSWORD,
// 	host: DB_HOST,
// 	port: Number(DB_PORT),
// 	database: DB_NAME,
// 	ssl: {
// 		rejectUnauthorized: true,
// 		ca: CA
// 	}
// };

// const postgresql = new Pool(config);

// // const postgresql = new Pool({ connectionString: DATABASE_URL });

// export { postgresql };

// // export const db = new Kysely<DB>({
// // 	dialect: new LibsqlDialect({
// // 		client
// // 	})
// // });

// export const db = new Kysely<DB>({
// 	dialect: new PostgresDialect({
// 		pool: postgresql
// 	})
// });
