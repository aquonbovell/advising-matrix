import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises';
import { db } from './db';

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

await db.deleteFrom('Course').execute();

await db.deleteFrom('CoursePrerequisite').execute();

for (const course of courseData) {
	await db
		.insertInto('Course')
		.values({
			id: course.id,
			code: course.code,
			name: course.name,
			level: course.level,
			credits: course.credits,
			departmentId: course.departmentId
		})
		.execute();
}

for (const course of courseData) {
	const prerequisites = course.prerequisites;

	for (const prerequisite of prerequisites) {
		console.log(prerequisite);
		
		await db
			.insertInto('CoursePrerequisite')
			.values({
				id: crypto.randomUUID(),
				courseId: course.id,
				prerequisiteId: prerequisite.prerequisiteId
			})
			.execute();
	}
}
