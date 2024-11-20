import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteFaculty, fetchFaculty } from '$lib/actions/faculty.actions';
import {
	deleteDepartment,
	fetchDepartment,
	fetchDepartmentDetails
} from '$lib/actions/department.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const department = await fetchDepartmentDetails(id);
	return { department };
};

export const actions: Actions = {
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteDepartment(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete department' });
		}
		return redirect(302, '/departments');
	}
};
