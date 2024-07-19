import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';
import type { Course, DB } from '../src/lib/db/schema';
import { Argon2id } from 'oslo/password';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const argon2id = new Argon2id();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

	const courseDataRaw = await fs.readFile(path.join(__dirname, 'courses.json'), 'utf-8');
	const courseData = JSON.parse(courseDataRaw);

	async function insertOrIgnore<TE extends keyof DB & string>(
		table: TE,
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

	// Insert Departments
	await insertOrIgnore('Department', {
		id: '1',
		name: 'Computer Science'
	});

	// Insert Majors
	await insertOrIgnore('Major', {
		id: '1',
		name: 'Computer Science',
		department_id: '1'
	});

	// Insert Courses
	for (const course of courseData) {
		await insertOrIgnore('Course', {
			id: course.id,
			code: course.code,
			name: course.name,
			level: parseInt(course.code.match(/\d+/)[0]),
			credits: course.credits,
			majorId: '1'
		} as Course);

		if (course.prerequisite) {
			console.log(`Inserting prerequisites for ${course.code}`);
			for (const prerequisiteId of course.prerequisite) {
				try {
					await db
						.insertInto('Prerequisite')
						.values({
							id: randomUUID(),
							course_id: course.id,
							prerequisite_id: prerequisiteId
						})
						.execute();
					console.log(`Inserted prerequisite ${prerequisiteId} for course ${course.id}`);
				} catch (error) {
					console.error(
						`Error inserting prerequisite ${prerequisiteId} for course ${course.id}:`,
						error
					);
				}
			}
		}
	}
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
