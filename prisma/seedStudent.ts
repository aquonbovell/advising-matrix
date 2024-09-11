import type { Course, DB } from '../src/lib/db/schema';
import 'dotenv/config';
import pg from 'pg';
import { randomUUID } from 'crypto';
import { Kysely, PostgresDialect } from 'kysely';
import { Argon2id } from 'oslo/password';

const { Pool } = pg;
const argon2id = new Argon2id();

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false
			}
		})
	})
}).withSchema('dev');

const seed = async () => {
	console.log('Seeding database...');

	await db.transaction().execute(async (db) => {
		// Insert Users - Advisor
		const [id] = [randomUUID()];
		await db
			.insertInto('StudentT')
			.values({
				id: id,
				user_id: 'b433faeb-1257-4b63-9bc3-9edb60231332',
				major_id: '42ed0b72-cc4c-42af-a20d-30ab56555dec',
				minor_id: 'fb8cd353-fd2d-43c7-aa5f-856d8e087f16',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();
	});

	db.destroy();
};

seed()
	.then(() => {
		console.log('Database added User successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
