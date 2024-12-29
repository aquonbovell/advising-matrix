import { db } from '$lib/server/db';
import { generateRandomId } from '$lib/server/utils';

export async function addPrerequisites(
	courseId: string,
	prerequisiteIds: string[]
): Promise<boolean> {
	let row: number = 0;
	for (const id of prerequisiteIds) {
		const result = await db
			.insertInto('prerequisites')
			.values({
				id: generateRandomId(),
				courseId: courseId,
				prerequisiteId: id
			})
			.returning('id')
			.execute();
		row += result.length;
	}
	return row === 0;
}

export async function deletePrerequisitesFromCourseId(courseId: string): Promise<boolean> {
	const result = await db
		.deleteFrom('prerequisites')
		.where('courseId', '=', courseId)
		.executeTakeFirstOrThrow();
	return result.numDeletedRows > 0;
}

export async function updatePrerequisites(
	courseId: string,
	prerequisiteIds: string[]
): Promise<boolean> {
	let row: number = 0;
	const deleteResult = await deletePrerequisitesFromCourseId(courseId);

	if (!deleteResult) {
		return false;
	}
	for (const id of prerequisiteIds) {
		const result = await db
			.insertInto('prerequisites')
			.values({
				id: generateRandomId(),
				courseId: courseId,
				prerequisiteId: id
			})
			.returning('id')
			.execute();
		row += result.length;
	}
	return row === 0;
}

export async function getPrerequisiteCoursesFromCourseId(courseId: string): Promise<string[]> {
	const rows = await db
		.selectFrom('prerequisites')
		.leftJoin('course', 'prerequisites.prerequisiteId', 'course.id')
		.select(['course.name', 'course.code'])
		.where('courseId', '==', courseId)
		.execute();
	return rows.map((row) => row.code + ' - ' + row.name);
}

export async function getPrerequisitesFromCourseId(courseId: string): Promise<string[]> {
	const rows = await db
		.selectFrom('prerequisites')
		.select(['prerequisites.prerequisiteId'])
		.where('courseId', '==', courseId)
		.execute();
	return rows.map((row) => row.prerequisiteId);
}
