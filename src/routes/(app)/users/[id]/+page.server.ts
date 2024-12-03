import { deleteUser, fetchUser } from '$lib/server/actions/user.actions';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	try {
		const user = await fetchUser(id);
		return { person: { ...user, role: user.role.toLocaleLowerCase() } };
	} catch (err) {
		console.error(err);
		return error(404, { message: 'Not found' });
	}
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete users' });
		}
		const { id } = params;
		try {
			await deleteUser(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete user' });
		}
		return { success: true };
	}
};
