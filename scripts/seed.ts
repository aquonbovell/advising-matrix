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
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false
			}
		})
	})
}).withSchema('prod');

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
	const hashedPassword = await argon2id.hash('password');

	console.log('Reading data files...');
	const departmentDataRaw = await fs.readFile(path.join(__dirname, 'departments.json'), 'utf-8');
	const departmentData = JSON.parse(departmentDataRaw);
	console.log('Departments read successfully');
	const courseDataRaw = await fs.readFile(path.join(__dirname, 'courses.json'), 'utf-8');
	const courseData = JSON.parse(courseDataRaw);
	console.log('Courses read successfully');
	const degreeDataRaw = await fs.readFile(path.join(__dirname, 'degrees.json'), 'utf-8');
	const degreeData = JSON.parse(degreeDataRaw);
	console.log('Degrees read successfully');

	await db.deleteFrom('CoursePrerequisite').execute();
	await db.deleteFrom('Course').execute();
	await db.deleteFrom('Degree').execute();
	await db.deleteFrom('Department').execute();

	// Insert Departments records
	for (const department of departmentData) {
		await insertOrIgnore('Department', department);
	}
	// Insert Courses
	for (const course of courseData) {
		await insertOrIgnore('Course', {
			id: course.id,
			code: course.code,
			name: course.name,
			level: parseInt(course.code.match(/\d+/)[0][0]),
			credits: course.credits,
			departmentId: course.department
		} as Course);
	}

	// Insert Courses Prerequisites
	for (const course of courseData) {
		if (course.prerequisite) {
			console.log(`Inserting prerequisites for ${course.code}`);
			for (const prerequisiteId of course.prerequisite) {
				try {
					await db
						.insertInto('CoursePrerequisite')
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

	await db.deleteFrom('User').execute();

	// Insert Users - Admin
	await insertOrIgnore('User', {
		id: randomUUID(),
		name: 'Admin',
		email: 'admin@cavehill.uwi.edu',
		role: 'ADMIN',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	// Insert Users - Advisor
	const [advisor_id, student_id] = [randomUUID(), randomUUID()];
	await insertOrIgnore('User', {
		id: advisor_id,
		name: 'Advisor 1',
		email: 'advisor1@cavehill.uwi.edu',
		role: 'ADVISOR',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	// Insert Users - Student
	await insertOrIgnore('User', {
		id: student_id,
		name: 'Student 1',
		email: 'student1@mycavehill.uwi.edu',
		role: 'STUDENT',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	// Insert Advisor data - Students
	await insertOrIgnore('Advisor', {
		id: advisor_id,
		user_id: student_id
	});

	await db.deleteFrom('ProgramRequirement').execute();
	await db.deleteFrom('Program').execute();

	// Insert Programs and Requirements
	for (const degree of degreeData) {
		try {
			const programId = randomUUID();
			// Insert Programs
			await insertOrIgnore('Program', {
				id: programId,
				name: degree.name
			});
			console.log('Program added successfully:', degree.name);
			// Insert Program Requirements
			console.log('Inserting requirements for:', degree);
			for (const element of degree.requirements) {
				const requirementId = randomUUID();
				if (element.type === 'CREDITS') {
					const requirementDetails = element;
					await insertOrIgnore('ProgramRequirement', {
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
					await insertOrIgnore('ProgramRequirement', {
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

	await db.deleteFrom('Student').execute();

	const programId = await db
		.selectFrom('Program')
		.where('name', '=', 'Biochemistry')
		.select('id')
		.executeTakeFirst();

	// Insert Student data - Advisor
	if (programId && programId.hasOwnProperty('id')) {
		await insertOrIgnore('Student', {
			id: randomUUID(),
			user_id: student_id,
			advisor_id: advisor_id,
			invite_token: null,
			program_id: programId.id,
			invite_expires: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
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
