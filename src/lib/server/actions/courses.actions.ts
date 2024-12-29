import { db } from '$lib/server/db';
import { generateRandomId } from '$lib/server/utils';

export async function checkCourseAvailability(
	name: string,
	id: string | null = null
): Promise<boolean> {
	if (id) {
		const row = await db
			.selectFrom('course')
			.select('name')
			.where('name', '==', name)
			.where('id', '!=', id)
			.execute();
		return row.length === 0;
	}
	const row = await db.selectFrom('course').select('name').where('name', '==', name).execute();
	return row.length === 0;
}
export async function checkCourseCodeAvailability(
	code: string,
	id: string | null = null
): Promise<boolean> {
	if (id) {
		const row = await db
			.selectFrom('course')
			.select('code')
			.where('code', '==', code)
			.where('id', '!=', id)
			.execute();
		return row.length === 0;
	}
	const row = await db.selectFrom('course').select('code').where('code', '==', code).execute();
	return row.length === 0;
}

export async function createCourse(
	name: string,
	code: string,
	level: number,
	description: string,
	credits: number,
	prerequisiteType: 'all' | 'one',
	prerequisiteCount: number,
	departmentId: string
): Promise<Course> {
	const result = await db
		.insertInto('course')
		.values({
			id: generateRandomId(),
			name: name,
			code: code,
			level: level,
			description: description,
			credits: credits,
			prerequisiteType: prerequisiteType,
			prerequisiteCount: prerequisiteCount,
			departmentId: departmentId
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const department = await db
		.selectFrom('department')
		.select('department.name')
		.where('id', '==', departmentId)
		.executeTakeFirstOrThrow();

	const course: Course = {
		id: result.id,
		name,
		code,
		level,
		description,
		credits,
		prerequisiteType,
		prerequisiteCount,
		departmentId,
		department: department.name
	};
	return course;
}

export async function updateCourse(
	Id: string,
	name: string,
	code: string,
	level: number,
	description: string,
	credits: number,
	prerequisiteType: 'all' | 'one',
	prerequisiteCount: number,
	departmentId: string
): Promise<Course> {
	const result = await db
		.updateTable('course')
		.set({
			name: name,
			code: code,
			level: level,
			description: description,
			credits: credits,
			prerequisiteType: prerequisiteType,
			prerequisiteCount: prerequisiteCount,
			departmentId: departmentId
		})
		.where('id', '==', Id)
		.returning('id')
		.executeTakeFirstOrThrow();

	const department = await db
		.selectFrom('department')
		.select('department.name')
		.where('id', '==', departmentId)
		.executeTakeFirstOrThrow();

	const course: Course = {
		id: result.id,
		name,
		code,
		level,
		description,
		credits,
		prerequisiteType,
		prerequisiteCount,
		departmentId,
		department: department.name
	};
	return course;
}

export async function getCourseFromId(Id: string) {
	const result = await db
		.selectFrom('course')
		.leftJoin('department', 'course.departmentId', 'department.id')
		.select([
			'course.id',
			'course.name',
			'course.code',
			'course.level',
			'course.description',
			'course.credits',
			'course.prerequisiteType',
			'course.prerequisiteCount',
			'course.departmentId',
			'department.name as department'
		])
		.where('course.id', '==', Id)
		.executeTakeFirst();
	return result;
}

export async function deleteCourseFromId(Id: string): Promise<boolean> {
	const result = await db.deleteFrom('course').where('id', '==', Id).executeTakeFirstOrThrow();

	return result.numDeletedRows > 0;
}

export async function getCourses() {
	const result = await db
		.selectFrom('course')
		.leftJoin('department', 'course.departmentId', 'department.id')
		.select([
			'course.id',
			'course.name',
			'course.code',
			'course.level',
			'course.description',
			'course.credits',
			'course.prerequisiteType',
			'course.prerequisiteCount',
			'course.departmentId',
			'department.name as department'
		])
		.execute();
	return result;
}

export async function getValidCourses(courseId: string) {
	const result = await db
		.selectFrom('course')
		.leftJoin('department', 'course.departmentId', 'department.id')
		.select([
			'course.id',
			'course.name',
			'course.code',
			'course.level',
			'course.description',
			'course.credits',
			'course.prerequisiteType',
			'course.prerequisiteCount',
			'course.departmentId',
			'department.name as department'
		])
		.where('course.id', '!=', courseId)
		.execute();
	return result;
}

export interface Course {
	id: string;
	name: string;
	code: string;
	level: number;
	description: string;
	credits: number;
	prerequisiteType: 'all' | 'one';
	prerequisiteCount: number;
	departmentId: string;
	department: string;
}
