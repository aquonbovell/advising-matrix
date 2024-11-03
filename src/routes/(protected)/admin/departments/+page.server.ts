import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		error(401, 'Unauthorized');
	}

	try {
		const departments = await db
			.selectFrom('Departments')
			.innerJoin('Faculties', 'Faculties.id', 'Departments.facultyId')
			.select([
				'Departments.id',
				'Departments.name as department_name',
				'Faculties.name as faculty_name'
			])
			.execute();
		return {
			departments
		};
	} catch (err) {
		console.error(err);
		error(500, 'An error occurred while fetching the departments');
	}
};
