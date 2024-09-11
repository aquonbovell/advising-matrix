import type { Course, DB, StudentCourses } from '../src/lib/db/schema';
import 'dotenv/config';
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import fs from 'fs/promises';

const { Pool } = pg;
type Omittable<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'F1' | 'F2' | 'F3' | null;
export type StudentGrade = Omittable<StudentCourses, 'id' | 'studentId' | 'courseId' | 'grade'> & {
	course: Omit<Course, 'departmentId'>;
	// grade: Grade;
	grades: { id: string; grade: Grade }[];
};

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

const data = await db.selectFrom('Course').selectAll().execute();

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

const fileContent: CourseData[] = [];

for (const course of data) {
	const courseData = await db
		.selectFrom('CoursePrerequisite')
		.innerJoin('Course', 'CoursePrerequisite.prerequisiteId', 'Course.id')
		.where('CoursePrerequisite.courseId', '=', course.id)
		.select([
			'CoursePrerequisite.courseId',
			'CoursePrerequisite.prerequisiteId',
			'Course.code',
			'Course.name',
			'Course.level',
			'Course.credits',
			'Course.departmentId'
		])
		.execute();

	fileContent.push({
		...course,
		prerequisites: courseData
	});
}

// console.log(fileContent);

const __dirname = path.dirname(__filename);

fs.writeFile(
	path.join(__dirname, 'coursesdata.json'),
	JSON.stringify(fileContent, null, 2),
	'utf-8'
);
