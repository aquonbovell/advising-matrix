import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';
import { randomUUID } from 'crypto';
import { Kysely, PostgresDialect } from 'kysely';
import { Argon2id } from 'oslo/password';
import { fileURLToPath } from 'url';

import { LibsqlDialect } from '@libsql/kysely-libsql';
import { createClient } from '@libsql/client';
import type { DB, Courses } from '../src/lib/db/schema';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const argon2id = new Argon2id();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN
});

// const postgresql = new Pool({ connectionString: DATABASE_URL });

// export { postgresql };

export const db = new Kysely<DB>({
	dialect: new LibsqlDialect({
		client
	})
});

async function insertOrIgnore<TE extends keyof DB & string>(table: TE, data: any) {
	try {
		await db.insertInto(table).values(data).execute();
		console.log(`Inserted data into: ${table}`);
	} catch (error) {
		if (error.code === '23505') {
			// Unique violation error code
			console.log(`Record already exists in ${table}, skipping`);
		} else {
			throw error;
		}
	}
}

const seed = async () => {
	console.log('Seeding database...');
	const hashedPassword = await argon2id.hash('Password2#');

	console.log('Reading data files...');
	const departmentDataRaw = await fs.readFile(path.join(__dirname, 'departments.json'), 'utf-8');
	const departmentData = JSON.parse(departmentDataRaw);
	console.log('Departments read successfully');
	const courseDataRaw = await fs.readFile(path.join(__dirname, 'courses.json'), 'utf-8');
	const courseData = JSON.parse(courseDataRaw);
	console.log('Courses read successfully');
	const majorDataRaw = await fs.readFile(path.join(__dirname, 'majors.json'), 'utf-8');
	const majorData = JSON.parse(majorDataRaw);
	console.log('majors read successfully');

	await db.deleteFrom('Prerequisites').execute();
	await db.deleteFrom('Courses').execute();
	await db.deleteFrom('Majors').execute();
	await db.deleteFrom('MajorRequirements').execute();
	// await db.deleteFrom('Departments').execute();

	// Insert Departments records
	for (const department of departmentData) {
		await insertOrIgnore('Departments', {
			...department,
			id: randomUUID(),
			facultyId: 'h54cjelmqlfivtcgehi5tfksqlfn4n4a'
		});
	}
	// Insert Courses
	for (const course of courseData) {
		await insertOrIgnore('Courses', {
			id: course.id,
			code: course.code,
			name: course.name,
			level: parseInt(course.code.match(/\d+/)[0][0]),
			credits: course.credits,
			departmentId: course.departmentId,
			prerequisiteAmount: course.prerequisiteAmount,
			prerequisiteType: course.prerequisiteType
		} as Courses);
	}

	// Insert Courses Prerequisites
	for (const course of courseData) {
		if (course.prerequisite) {
			console.log(`Inserting prerequisites for ${course.code}`);
			for (const prerequisiteId of course.prerequisite) {
				try {
					await db
						.insertInto('Prerequisites')
						.values({
							id: randomUUID(),
							courseId: course.id,
							prerequisiteId: prerequisiteId
						})
						.execute();
					console.log(`Inserted prerequisite ${prerequisiteId} for course ${course.id}`);
				} catch (error) {
					if (error.code === '23505') {
						// Unique constraint violation (prerequisite already exists)
						console.log(
							`Prerequisite ${prerequisiteId} for course ${course.id} already exists, skipping`
						);
					} else {
						console.error(
							`Error inserting prerequisite ${prerequisiteId} for course ${course.id}:`,
							error
						);
					}
				}
			}
		}
	}

	// Insert Programs and Requirements
	for (const major of majorData) {
		try {
			const programId = randomUUID();
			// Insert Programs
			await insertOrIgnore('Majors', {
				id: programId,
				name: major.name
			});
			console.log('Program added successfully:', major.name);
			// Insert Program Requirements
			console.log('Inserting requirements for:', major);
			for (const element of major.requirements) {
				const requirementId = randomUUID();
				if (element.type === 'CREDITS') {
					const requirementDetails = element;
					await insertOrIgnore('MajorRequirements', {
						id: requirementId,
						programId: programId,
						type: 'CREDITS',
						credits: requirementDetails.courses.length * 3, // Assuming each course is 3 credits
						details: JSON.stringify({ courses: requirementDetails.courses })
					});
					console.log('Inserted credits successfully for:', programId);
				} else if (element.type === 'POOL') {
					const requirementDetails = {
						levelPool: element.levelPool,
						facultyPool: element.facultyPool
					};
					await insertOrIgnore('MajorRequirements', {
						id: requirementId,
						programId: programId,
						type: 'POOL',
						credits: element.credits,
						details: JSON.stringify(requirementDetails)
					});
					console.log('Inserted pool successfully for:', programId);
				}
			}
			console.log('Added requirements successfully for:', programId);
		} catch (error) {
			console.error('Error inserting program or requirements:', error);
		}
	}

	await db.deleteFrom('User').execute();

	// Insert Users - Admin
	await insertOrIgnore('User', {
		id: randomUUID(),
		name: 'Admin',
		email: 'admin@cavehill.uwi.edu',
		role: 'ADMIN',
		password: hashedPassword,
		alternate_email: 'admin.alternate@cavehill.uwi.edu',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	// // Insert Users - Advisor
	const [advisor_id, student_id, user_id] = [randomUUID(), randomUUID(), randomUUID()];
	await insertOrIgnore('User', {
		id: advisor_id,
		name: 'Advisor 1',
		email: 'advisor1@cavehill.uwi.edu',
		role: 'ADVISOR',
		password: hashedPassword,
		alternate_email: 'advisor1.alternate@cavehill.uwi.edu',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	// // Insert Users - Student
	await insertOrIgnore('User', {
		id: user_id,
		name: 'Student 1',
		email: 'student1@mycavehill.uwi.edu',
		role: 'STUDENT',
		password: hashedPassword,
		alternate_email: 'student1.alternate@mycavehill.uwi.edu',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	const programId = await db
		.selectFrom('Majors')
		.where('name', '=', 'Biochemistry')
		.select('id')
		.executeTakeFirst();

	await db.deleteFrom('Student').execute();
	// Insert Student data - Advisor
	if (programId && programId.hasOwnProperty('id')) {
		await insertOrIgnore('Student', {
			id: student_id,
			user_id: user_id,
			invite_token: null,
			major_id: programId.id,
			invite_expires: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		});
		// // Insert Advisor data - Students
		await insertOrIgnore('Advisor', {
			advisor_id: advisor_id,
			student_id: student_id
		});
	}

	db.destroy();
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
