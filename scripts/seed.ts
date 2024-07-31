import type { Course, DB } from '../src/lib/db/schema';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';
import { randomUUID } from 'crypto';
import { Kysely, PostgresDialect } from 'kysely';
import { Argon2id } from 'oslo/password';
import { fileURLToPath } from 'url';

const { Pool } = pg;
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

	// const courseDataRaw = await fs.readFile(path.join(__dirname, 'courses.json'), 'utf-8');
	// const courseData = JSON.parse(courseDataRaw);
	const degreeDataRaw = await fs.readFile(path.join(__dirname, 'degrees.json'), 'utf-8');
	const degreeData = JSON.parse(degreeDataRaw);

	async function insertOrIgnore<TE extends keyof DB & string>(
		table: TE,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any
	) {
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

	// Insert Users - Admin
	await insertOrIgnore('User', {
		id: '1',
		name: 'Admin',
		email: 'admin@cavehill.uwi.edu',
		role: 'ADMIN',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	db.updateTable('User').set('name', 'Admin').where('User.id', '=', '1').execute();

	// Insert Users - Advisor
	await insertOrIgnore('User', {
		id: '2',
		name: 'Advisor 1',
		email: 'advisor1@cavehill.uwi.edu',
		role: 'ADVISOR',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	db.updateTable('User').set('name', 'Advisor 1').where('User.id', '=', '2').execute();

	// Insert Users - Student
	await insertOrIgnore('User', {
		id: '3',
		name: 'Student 1',
		email: 'student1@mycavehill.uwi.edu',
		role: 'STUDENT',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	db.updateTable('User').set('name', 'Student 1').where('User.id', '=', '3').execute();

	// Insert Advisor data - Students
	await insertOrIgnore('Advisor', {
		id: '1',
		user_id: '2'
	});

	// Insert Student data - Advisor
	await insertOrIgnore('Student', {
		id: '1',
		user_id: '3',
		advisor_id: '1',
		invite_token: null,
		program_id: 1,
		invite_expires: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	const deparments: { id: string; name: string }[] = [
		{
			id: '1',
			name: 'Computer Science, Mathematics and Physics'
		},
		{
			id: '2',
			name: 'Biological and Chemical Sciences'
		}
	];

	// Insert Departments
	for (const department of deparments) {
		await insertOrIgnore('Department', department);
	}

	// // Insert Courses
	// for (const course of courseData) {
	// 	await insertOrIgnore('Course', {
	// 		id: course.id,
	// 		code: course.code,
	// 		name: course.name,
	// 		level: parseInt(course.code.match(/\d+/)[0][0]),
	// 		credits: course.credits,
	// 		departmentId: course.department
	// 	} as Course);

	// 	if (course.prerequisite) {
	// 		console.log(`Inserting prerequisites for ${course.code}`);
	// 		for (const prerequisiteId of course.prerequisite) {
	// 			try {
	// 				await db
	// 					.insertInto('CoursePrerequisite')
	// 					.values({
	// 						id: randomUUID(),
	// 						courseId: course.id,
	// 						prerequisiteId: prerequisiteId
	// 					})
	// 					.execute();
	// 				console.log(`Inserted prerequisite ${prerequisiteId} for course ${course.id}`);
	// 			} catch (error) {
	// 				if (error.code === '23505') {
	// 					// Unique constraint violation (prerequisite already exists)
	// 					console.log(
	// 						`Prerequisite ${prerequisiteId} for course ${course.id} already exists, skipping`
	// 					);
	// 				} else {
	// 					console.error(
	// 						`Error inserting prerequisite ${prerequisiteId} for course ${course.id}:`,
	// 						error
	// 					);
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	try {
		for (const degree of degreeData) {
			const programId = randomUUID();
			// Insert Programs
			await insertOrIgnore('Program', {
				id: programId,
				name: degree.name
			});

			console.log('Program seeded successfully:', degree.name);

			// Insert Program Courses
			console.log('Inserting courses for:', degree);
			for (const element of degree.requirements) {
				if (element.name === 'Chemistry') {
					console.log('Chemistry program detected, skipping');
					console.log(element)
				}
				const requirementId = randomUUID();
				if (element.type === 'CREDITS') {
					const requirementDetails = element;
					await insertOrIgnore('ProgramRequirement', {
						id: requirementId,
						programId: programId,
						type: 'CREDITS',
						credits: requirementDetails.courses.length * 3, // Assuming each course is 3 credits
						details: JSON.stringify({courses: requirementDetails.courses})
					});
					console.log('Credits seeded successfully for:', programId);
				} else if (element.type === 'POOL') {
					const requirementDetails = {
						levelPool: element.levelPool,
						facultyPool: element.facultyPool
					};
					await insertOrIgnore('ProgramRequirement', {
						id: requirementId,
						programId: programId,
						type: 'POOL',
						credits: element.credits,
						details: JSON.stringify(requirementDetails)
					});
					console.log('Pool seeded successfully for:', programId);
				}
				console.log('Electives seeded successfully for:', programId);
			};
		}
	} catch (error) {
		console.error('Error inserting program:', error);
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
