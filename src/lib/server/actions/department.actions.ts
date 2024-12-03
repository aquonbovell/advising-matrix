import { generateId } from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { DB, Department } from '$lib/server/db/schema';
import type { ReferenceExpression } from 'kysely';

export const fetchDepartments = async () => {
	return db
		.selectFrom('Department')
		.innerJoin('Faculty', 'Department.facultyId', 'Faculty.id')
		.select(['Department.name as departmentName', 'Department.id', 'Faculty.name as facultyName'])
		.execute();
};

export const fetchDepartmentsAll = async () => {
	return db.selectFrom('Department').select(['name', 'id']).execute();
};

export const createDepartment = async (department: Omit<Department, 'id'>) => {
	try {
		const result = await db
			.insertInto('Department')
			.values({
				id: generateId(),
				...department
			})
			.returning('id')
			.executeTakeFirstOrThrow();
		return result.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const fetchDepartment = async (departmentId: string) => {
	try {
		const department = await db
			.selectFrom('Department')
			.where('id', '=', departmentId)
			.select(['id', 'name', 'facultyId'])
			.executeTakeFirstOrThrow();
		return department;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const fetchDepartmentDetails = async (departmentId: string) => {
	try {
		const department = await db
			.selectFrom('Department')
			.innerJoin('Faculty', 'Department.facultyId', 'Faculty.id')
			.where('Department.id', '=', departmentId)
			.select(['Department.id', 'Department.name as departmentName', 'Faculty.name as facultyName'])
			.executeTakeFirstOrThrow();
		return department;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteDepartment = async (departmentId: string) => {
	return db.deleteFrom('Department').where('id', '=', departmentId).execute();
};
export const updateDepartment = async (department: Department) => {
	try {
		const result = await db
			.updateTable('Department')
			.set({
				name: department.name,
				facultyId: department.facultyId
			})
			.where('id', '=', department.id)
			.returning('id')
			.executeTakeFirstOrThrow();
		return result.id;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export async function exist(
	value: string,
	field: ReferenceExpression<DB, 'Department'>,
	id: string | undefined = undefined
) {
	if (id) {
		const department = await db
			.selectFrom('Department')
			.where(field, '=', value)
			.where('id', '!=', id)
			.select('id')
			.executeTakeFirst();
		return department !== undefined;
	}
	const department = await db
		.selectFrom('Department')
		.where(field, '=', value)
		.select('id')
		.executeTakeFirst();
	return department !== undefined;
}
