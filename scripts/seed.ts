import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
// import { DATABASE_URL } from '$env/static/private';
import type { DB } from '../src/lib/db/schema';
import { Argon2id } from 'oslo/password';

const sqlite = new Database('db.sqlite');
const argon2id = new Argon2id();

const db = new Kysely<DB>({
	dialect: new SqliteDialect({
		database: sqlite
	})
});

async function seed() {
	console.log('Seeding database...');
	await db.transaction().execute(async (trx) => {
		const hashedPassword = await argon2id.hash('password');
		// Insert Admin User
		await trx
			.insertInto('User')
			.values({
				id: '1',
				email: 'admin@uwi.edu',
				role: 'ADMIN',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Insert Advisor User
		await trx
			.insertInto('User')
			.values({
				id: '2',
				email: 'advisor@uwi.edu',
				role: 'ADVISOR',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Insert Advisor
		await trx
			.insertInto('Advisor')
			.values({
				id: '1',
				user_id: '2'
			})
			.execute();

		// Insert Student User
		await trx
			.insertInto('User')
			.values({
				id: '3',
				email: 'student@uwi.edu',
				role: 'STUDENT',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Insert Student
		await trx
			.insertInto('Student')
			.values({
				id: '1',
				user_id: '3',
				advisor_id: '1',
				invite_token: null,
				invite_expires: null,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();
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
