import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	checkMajorAvailability,
	deleteMajorFromId,
	getMajorFromId,
	updateMajor,
	updateRequirements
} from '$lib/server/actions/major.actions';
import { majorUpdateSchema } from '$lib/schemas/major';
import { getRequirementDetails } from '$lib/server/actions/requirements.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const major = await getMajorFromId(event.params.id);

	if (!major) {
		error(404, 'Major not found');
	}

	const form = await superValidate(zod(majorUpdateSchema));

	form.data = {
		id: major.id,
		name: major.name,
		requirements: major.requirements
	};
	return { form, requirements: await getRequirementDetails() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(majorUpdateSchema));

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

		const name = await checkMajorAvailability(form.data.name, form.data.id);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Major already exists. Please choose another name'
			];
			return fail(400, { form });
		}

		try {
			console.log('Updating user');

			console.log(form.data);

			await updateMajor(form.data.id, form.data.name);

			await updateRequirements(form.data.id, form.data.requirements);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update major', type: 'failure' }, { status: 400 });
		}
		return redirect(302, `/disciplines/majors/show/${form.data.id}`);
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
				message: "Enter the major's Id"
			});
		}

		const deleted = await deleteMajorFromId(id);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
