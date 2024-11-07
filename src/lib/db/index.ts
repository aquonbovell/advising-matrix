import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import type { DB } from './schema';
import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL, CA, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const config = {
	user: DB_USER,
	password: DB_PASSWORD,
	host: DB_HOST,
	port: Number(DB_PORT),
	database: DB_NAME,
	ssl: {
		rejectUnauthorized: true,
		ca: CA
	}
};

const postgresql = new Pool(config);

export { postgresql };

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: postgresql
	})
});
