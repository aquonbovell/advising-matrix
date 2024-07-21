import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';
import type { DB } from '../src/lib/db/schema';
import { Argon2id } from 'oslo/password';

const argon2id = new Argon2id();

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL
		})
	})
});

async function seed() {
	console.log('Seeding database...');
	const hashedPassword = await argon2id.hash('password');

	async function insertOrIgnore(
		table:
			| 'Advisor'
			| 'Course'
			| 'Department'
			| 'Major'
			| 'Prerequisite'
			| 'Session'
			| 'Student'
			| 'User',
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any
	) {
		try {
			await db.insertInto(table).values(data).execute();
			console.log(`Inserted into ${table}`);
		} catch (error) {
			if (error.code === '23505') {
				// Unique violation error code
				console.log(`Record already exists in ${table}, skipping`);
			} else {
				throw error;
			}
		}
	}

	// Insert Users
	await insertOrIgnore('User', {
		id: '1',
		email: 'admin@uwi.edu',
		role: 'ADMIN',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	await insertOrIgnore('User', {
		id: '2',
		email: 'advisor@uwi.edu',
		role: 'ADVISOR',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	await insertOrIgnore('User', {
		id: '3',
		email: 'student@uwi.edu',
		role: 'STUDENT',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	// Insert Advisor
	await insertOrIgnore('Advisor', {
		id: '1',
		user_id: '2'
	});

	// Insert Student
	await insertOrIgnore('Student', {
		id: '1',
		user_id: '3',
		advisor_id: '1',
		invite_token: null,
		invite_expires: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});
}

seed()
	.then(() => {
		console.log('Database seeded successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
