import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getFacultyFromId, deleteFacultyFromId } from '$lib/server/actions/faculty.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const faculty = await getFacultyFromId(event.params.id);

	if (!faculty) {
		error(404, 'Faculty not found');
	}
	return { faculty };
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
				message: "Enter the faculty's Id"
			});
		}

		const deleted = await deleteFacultyFromId(id);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
