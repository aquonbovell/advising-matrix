import { db } from '$lib/server/db';
import { generateRandomId } from '$lib/server/utils';

export async function checkDepartmentAvailability(
	name: string,
	id: string | null = null
): Promise<boolean> {
	if (id) {
		const row = await db
			.selectFrom('department')
			.select('name')
			.where('name', '==', name)
			.where('id', '!=', id)
			.execute();
		return row.length === 0;
	}
	const row = await db.selectFrom('department').select('name').where('name', '==', name).execute();
	return row.length === 0;
}

export async function createDepartment(name: string, facultyId: string): Promise<Department> {
	const result = await db
		.insertInto('department')
		.values({
			id: generateRandomId(),
			name: name,
			facultyId: facultyId
		})
		.returning('id')
		.executeTakeFirstOrThrow();

	const faculty = await db
		.selectFrom('faculty')
		.select('faculty.name')
		.where('id', '==', facultyId)
		.executeTakeFirstOrThrow();

	const user: Department = {
		id: result.id,
		name,
		facultyId,
		facultyName: faculty.name
	};
	return user;
}

export async function updateDepartment(
	Id: string,
	name: string,
	facultyId: string
): Promise<Department> {
	const result = await db
		.updateTable('department')
		.set({
			name: name,
			facultyId: facultyId
		})
		.where('id', '==', Id)
		.returning('id')
		.executeTakeFirstOrThrow();

	const faculty = await db
		.selectFrom('faculty')
		.select('faculty.name')
		.where('id', '==', facultyId)
		.executeTakeFirstOrThrow();

	const department: Department = {
		id: result.id,
		name,
		facultyId,
		facultyName: faculty.name
	};

	return department;
}

export async function getDepartmentFromId(Id: string) {
	const result = await db
		.selectFrom('department')
		.leftJoin('faculty', 'faculty.id', 'department.facultyId')
		.select([
			'department.id',
			'department.name',
			'faculty.id as facultyId',
			'faculty.name as facultyName'
		])
		.where('department.id', '==', Id)
		.executeTakeFirst();
	return result;
}

export async function deleteDepartmentFromId(Id: string): Promise<boolean> {
	const result = await db.deleteFrom('department').where('id', '==', Id).executeTakeFirstOrThrow();

	return result.numDeletedRows > 0;
}

export async function getDepartments() {
	const result = await db
		.selectFrom('department')
		.leftJoin('faculty', 'faculty.id', 'department.facultyId')
		.select([
			'department.id',
			'department.name',
			'faculty.id as facultyId',
			'faculty.name as facultyName'
		])
		.execute();
	return result;
}

export interface Department {
	id: string;
	name: string;
	facultyId: string;
	facultyName: string;
}
