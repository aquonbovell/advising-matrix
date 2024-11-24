import { deleteUser, fetchUsers } from '$lib/actions/user.actions';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const role = locals.user?.role;
	if (role !== 'ADMIN') {
		redirect(303, '/');
	}
	return { users: await fetchUsers() };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete majors' });
		}
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteUser(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete user' });
		}
		return { success: true };
	}
};
