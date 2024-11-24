import { generateId } from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { DB, Faculty } from '$lib/server/db/schema';
import type { ReferenceExpression } from 'kysely';

export const fetchFaculties = async () => {
	return db.selectFrom('Faculty').select(['name', 'id']).execute();
};

export const createFaculty = async (faculty: Omit<Faculty, 'id'>) => {
	try {
		const result = await db
			.insertInto('Faculty')
			.values({
				id: generateId(),
				...faculty
			})
			.returning('id')
			.executeTakeFirstOrThrow();
		return result.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const fetchFaculty = async (facultyId: string) => {
	try {
		const faculty = await db
			.selectFrom('Faculty')
			.where('id', '=', facultyId)
			.select(['id', 'name'])
			.executeTakeFirstOrThrow();
		return faculty;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteFaculty = async (facultyId: string) => {
	return db.deleteFrom('Faculty').where('id', '=', facultyId).execute();
};
export const updateFaculty = async (faculty: Faculty) => {
	try {
		const result = await db
			.updateTable('Faculty')
			.set({
				name: faculty.name
			})
			.where('id', '=', faculty.id)
			.returning('id')
			.executeTakeFirstOrThrow();
		return result.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export async function exist(value: string, field: ReferenceExpression<DB, 'Faculty'>) {
	const department = await db
		.selectFrom('Faculty')
		.where(field, '=', value)
		.select('id')
		.executeTakeFirst();
	return department !== undefined;
}
