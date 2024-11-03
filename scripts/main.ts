import data from './courses.json';
import 'dotenv/config';
import { db } from '../prisma/db';

const departments: string[] = [];
const faculties: string[] = [];

for (const course of data) {
	if (!departments.includes(course.departmentId)) {
		departments.push(course.departmentId);
	}
}

console.log(departments);
