import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteDepartment, fetchDepartmentDetails } from '$lib/actions/department.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	try {
		const department = await fetchDepartmentDetails(id);
		return { department };
	} catch (err) {
		console.error(err);
		return error(404, {
			message: 'Not found'
		});
	}
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
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
