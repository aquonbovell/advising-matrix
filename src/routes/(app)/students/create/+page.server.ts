import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { studentCreationSchema } from './studentCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createUser } from '$lib/actions/user.actions';
import { createStudent, fetchAvailableUsers } from '$lib/actions/student.actions';
import { fetchAdvisors } from '$lib/actions/advisor.actions';
import { fetchMajors } from '$lib/actions/major.actions';
import { fetchMinors } from '$lib/actions/minor.actions';

export const load: PageServerLoad = async () => {
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

		if (!form.valid) {
			return fail(404, { form });
		}

		console.log(form.data);

		try {
			const studentId = await createStudent(form.data, form.data.advisors);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	}
};
