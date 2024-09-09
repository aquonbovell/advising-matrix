import type { DB } from '../src/lib/db/schema';
import 'dotenv/config';
import pg from 'pg';
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
		await db.deleteFrom('User').execute();

		await db.deleteFrom('Advisor').execute();

		await db.deleteFrom('Student').execute();

		await db
			.insertInto('User')
			.values({
				id: crypto.randomUUID(),
				name: 'Admin',
				email: 'admin@cavehill.uwi.edu',
				role: 'ADMIN',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Insert User - Advisor
		const [advisor_id, student_id] = [crypto.randomUUID(), crypto.randomUUID()];

		await db
			.insertInto('User')
			.values({
				id: advisor_id,
				name: 'Advisor',
				email: 'advisor1@cavehill.uwi.edu',
				role: 'ADVISOR',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Insert User - Student
		await db
			.insertInto('User')
			.values({
				id: student_id,
				name: 'Student 1',
				email: 'student1@mycavehill.uwi.edu',
				role: 'STUDENT',
				password: hashedPassword,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		await db
			.insertInto('Student')
			.values({
				id: crypto.randomUUID(),
				user_id: student_id,
				invite_token: null,
				program_id: '090e8c5e-e71b-432f-ba01-f8ba47f1cad0',
				invite_expires: null,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.execute();

		// Get Student ID from db
		const student = await db
			.selectFrom('Student')
			.where('Student.user_id', '==', student_id)
			.select('id')
			.executeTakeFirst();

		// Insert Advisor data - Students
		await db
			.insertInto('Advisor')
			.values({
				advisor_id: advisor_id,
				student_id: student?.id!
			})
			.execute();
	});

	db.destroy();
	console.log('Connection closed');
};

seed()
	.then(() => {
		console.log('Database seeded successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
