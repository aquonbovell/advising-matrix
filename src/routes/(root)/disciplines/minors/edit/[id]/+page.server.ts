import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	checkMinorAvailability,
	deleteMinorFromId,
	getMinorFromId,
	updateMinor
} from '$lib/server/actions/minor.actions';
import { minorUpdateSchema } from '$lib/schemas/minor';

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

	const form = await superValidate(zod(minorUpdateSchema));

	form.data = {
		id: minor.id,
		name: minor.name
	};
	return { form };
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(minorUpdateSchema));

		if (event.locals.session === null || event.locals.user === null) {
			return message(form, { message: 'Not authenticated', type: 'error' }, { status: 401 });
		}

		// if (
		// 	!event.locals.user.emailVerified ||
		// 	!event.locals.user.registered2FA ||
		// 	event.locals.session.twoFactorVerified
		// ) {
		// 	return message(form, { message: 'Forbidden', type: 'error' }, { status: 403 });
		// }

		if (event.locals.user.role !== 'admin') {
			return message(form, { message: 'Forbidden', type: 'error' }, { status: 403 });
		}

		if (!form.valid) {
			return fail(404, { form });
		}

		const name = await checkMinorAvailability(form.data.name, form.data.id);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Minor already exists. Please choose another name'
			];
			return fail(400, { form });
		}

		try {
			console.log('Updating user');

			console.log(form.data);

			await updateMinor(form.data.id, form.data.name);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update minor', type: 'failure' }, { status: 400 });
		}
		return redirect(302, `/disciplines/minors/show/${form.data.id}`);
	},
	delete: async (event) => {
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
