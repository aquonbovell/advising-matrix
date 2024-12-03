import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { studentCreationSchema } from './studentCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createStudent, fetchAvailableUsers } from '$lib/server/actions/student.actions';
import { fetchAdvisors } from '$lib/server/actions/advisor.actions';
import { fetchMajors } from '$lib/server/actions/major.actions';
import { fetchMinors } from '$lib/server/actions/minor.actions';

export const load: PageServerLoad = async ({ locals }) => {
	const role = locals.user?.role;

	if (role !== 'ADMIN') {
		redirect(303, '/');
	}
	return {
		form: await superValidate(zod(studentCreationSchema)),
		availableUsers: await fetchAvailableUsers(),
		advisors: await fetchAdvisors(),
		majors: await fetchMajors(),
		minors: await fetchMinors()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(studentCreationSchema));
		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit users', type: 'failure' },
				{ status: 403 }
			);
		}

		if (!form.valid) {
			return fail(404, { form });
		}

		try {
			const studentId = await createStudent(form.data, form.data.advisors);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create student', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Student created', type: 'success' });
	}
};
