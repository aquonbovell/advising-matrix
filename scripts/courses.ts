import type { Course, DB, StudentCourse } from '../src/lib/db/schema';
import 'dotenv/config';
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import fs from 'fs/promises';

const { Pool } = pg;

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

type CourseData = {
	id: number;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
	prerequisites: {
		courseId: number;
		prerequisiteId: number;
		code: string;
		name: string;
		level: number;
		credits: number;
		departmentId: string;
	}[];
};

const __dirname = path.dirname(__filename);

const data = await fs.readFile(path.join(__dirname, 'coursesdata.json'), 'utf-8');

const courseData: CourseData[] = JSON.parse(data);

await db.deleteFrom('CoursePrerequisite').execute();

for (const course of courseData) {
	const prerequisites = course.prerequisites;

	for (const prerequisite of prerequisites) {
		await db
			.insertInto('CoursePrerequisite')
			.values({
				id: crypto.randomUUID(),
				courseId: course.id,
				prerequisiteId: prerequisite.courseId
			})
			.execute();
	}
}
