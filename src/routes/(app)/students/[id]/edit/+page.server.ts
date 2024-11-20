import { fetchUser, updateUser } from '$lib/actions/user.actions';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { studentUpdateSchema } from './studentUpdate.schema';
import { deleteStudent, fetchStudent, updateStudent } from '$lib/actions/student.actions';
import { fetchAdvisors } from '$lib/actions/advisor.actions';
import { fetchMajors } from '$lib/actions/major.actions';
import { fetchMinors } from '$lib/actions/minor.actions';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const student = await fetchStudent(id);

	return {
		form: await superValidate({ ...student }, zod(studentUpdateSchema)),
		user: await fetchUser(student.userId),
		advisors: await fetchAdvisors(),
		majors: await fetchMajors(),
		minors: await fetchMinors()
	};
};

export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(studentUpdateSchema));
		if (!form.valid) return fail(404, { form });
		console.log(form.data);

		try {
			const userId = await updateStudent(form.data, form.data.advisors);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	},
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteStudent(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete student' });
		}
		return redirect(302, '/students');
	}
};
