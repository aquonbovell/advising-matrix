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
	const hashedPassword = await argon2id.hash(process.env.DEFAULT_PASSWORD!);

	await db.transaction().execute(async (db) => {
		// Insert Users - Advisor
		const [advisor_id] = [randomUUID()];
		await db
			.insertInto('User')
			.values({
				id: advisor_id,
				name: 'Advisor 2',
				email: 'advisor2@cavehill.uwi.edu',
				role: 'ADVISOR',
				password: hashedPassword,
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
