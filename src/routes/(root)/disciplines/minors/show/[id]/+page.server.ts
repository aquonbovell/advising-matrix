import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteUserFromId, getUserFromId } from '$lib/server/actions/user.actions';
import { error } from '@sveltejs/kit';
import { deleteMinorFromId, getMinorFromId } from '$lib/server/actions/minor.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const minor = await getMinorFromId(event.params.id);

	if (!minor) {
		error(404, 'Minor not found');
	}
	return { minor };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return fail(401, {
				message: 'Not authenticated'
			});
		}
		if (event.locals.user.role !== 'admin') {
			return fail(403, {
				message: 'Forbidden'
			});
		}

		const formData = await event.request.formData();

		const id = formData.get('id');

		if (typeof id !== 'string') {
			return fail(400, {
				message: 'Invalid or missing fields'
			});
		}
		if (id === '') {
			return fail(400, {
				message: "Enter the minor's Id"
			});
		}

		const deleted = await deleteMinorFromId(id);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
