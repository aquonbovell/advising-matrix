import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { requirementCreationSchema } from '$lib/schemas/requirement';
import { createRequirement } from '$lib/server/actions/requirements.actions';
import { getCourses } from '$lib/server/actions/courses.actions';
import { getFaculties } from '$lib/server/actions/faculty.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}
	return {
		form: await superValidate(zod(requirementCreationSchema)),
		courses: await getCourses(),
		faculties: await getFaculties()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(requirementCreationSchema));

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
			console.log('Creating requirement');

			console.log(form.data);

			const requirement = await createRequirement(
				form.data.type,
				form.data.option,
				form.data.details.join(','),
				form.data.level,
				form.data.credits
			);
			return message(form, { message: 'requirement created', type: 'success', id: requirement.id });
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create requirement', type: 'failure' },
				{ status: 400 }
			);
		}
	}
};
