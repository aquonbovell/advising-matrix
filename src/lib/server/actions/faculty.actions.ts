import { db } from '$lib/server/db';
import { generateRandomId } from '$lib/server/utils';

export async function checkFacultyAvailability(name: string): Promise<boolean> {
	const row = await db.selectFrom('faculty').select('name').where('name', '==', name).execute();
	return row.length === 0;
}

export async function createFaculty(name: string): Promise<Faculty> {
	const result = await db
		.insertInto('faculty')
		.values({
			id: generateRandomId(),
			name: name
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const user: Faculty = {
		id: result.id,
		name
	};
	return user;
}

export async function updateFaculty(Id: string, name: string): Promise<Faculty> {
	const result = await db
		.updateTable('faculty')
		.set({
			name: name
		})
		.where('id', '==', Id)
		.returning('id')
		.executeTakeFirstOrThrow();

	const faculty: Faculty = {
		id: result.id,
		name
	};

	return faculty;
}

export async function getFacultyFromId(Id: string) {
	const result = await db
		.selectFrom('faculty')
		.leftJoin('department', 'department.id', 'faculty.id')
		.select([
			'faculty.id',
			'faculty.name',
			'department.id as departmentId',
			'department.name as departmentName'
		])
		.where('faculty.id', '==', Id)
		.executeTakeFirst();
	return result;
}

export async function deleteFacultyFromId(Id: string): Promise<boolean> {
	const result = await db.deleteFrom('faculty').where('id', '==', Id).executeTakeFirstOrThrow();

	return result.numDeletedRows > 0;
}

export async function getFaculties() {
	const result = await db.selectFrom('faculty').select(['faculty.id', 'faculty.name']).execute();
	return result;
}

export async function checkFacultyIdValidity(id: string) {
	const result = await db.selectFrom('faculty').select('id').where('id', '==', id).execute();

	return result.length > 0;
}

export interface Faculty {
	id: string;
	name: string;
}
