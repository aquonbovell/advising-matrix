import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteDepartment, fetchDepartmentDetails } from '$lib/actions/department.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const department = await fetchDepartmentDetails(id);
	return { department };
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { message: 'You do not have permission to delete departments' });
		}
		const { id } = params;
		try {
			await deleteDepartment(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete department' });
		}
		return { success: true };
	}
};
