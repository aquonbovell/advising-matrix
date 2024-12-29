import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getCourses } from '$lib/server/actions/courses.actions';
import { getFaculties } from '$lib/server/actions/faculty.actions';
import {
	deleteRequirementFromId,
	getRequirementFromId,
	updateRequirement
} from '$lib/server/actions/requirements.actions';
import { requirementUpdateSchema } from '$lib/schemas/requirement';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const requirement = await getRequirementFromId(event.params.id);

	if (!requirement) {
		error(404, 'Major not found');
	}

	const form = await superValidate(zod(requirementUpdateSchema));

	form.data = {
		id: requirement.id,
		type: requirement.type,
		option: requirement.option,
		details: requirement.details.split(','),
		level: requirement.level,
		credits: requirement.credits
	};
	return {
		form,
		courses: await getCourses(),
		faculties: await getFaculties()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(requirementUpdateSchema));

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

		try {
			console.log('Updating user');

			console.log(form.data);

			await updateRequirement(
				form.data.id,
				form.data.type,
				form.data.option,
				form.data.details.join(','),
				form.data.level,
				form.data.credits
			);
		} catch (err) {
			console.error(err);
			return message(form, { message: 'Failed to update major', type: 'failure' }, { status: 400 });
		}
		return redirect(302, `/disciplines/requirements/show/${form.data.id}`);
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
				message: "Enter the requirement's id"
			});
		}

		const deleted = await deleteRequirementFromId(id);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
