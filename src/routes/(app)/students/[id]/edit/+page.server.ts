import { fetchUser, updateUser } from '$lib/server/actions/user.actions';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { studentUpdateSchema } from './studentUpdate.schema';
import { deleteStudent, fetchStudent, updateStudent } from '$lib/server/actions/student.actions';
import { fetchAdvisors } from '$lib/server/actions/advisor.actions';
import { fetchMajors } from '$lib/server/actions/major.actions';
import { fetchMinors } from '$lib/server/actions/minor.actions';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const role = locals.user?.role;

	if (role === 'STUDENT') {
		redirect(303, '/');
	}
	const { id } = params;
	try {
		const student = await fetchStudent(id);

		return {
			form: await superValidate({ ...student }, zod(studentUpdateSchema)),
			user: await fetchUser(student.userId),
			advisors: await fetchAdvisors(),
			majors: await fetchMajors(),
			minors: await fetchMinors()
		};
	} catch (err) {
		console.error(err);
		error(404, { message: 'Not found' });
	}
};

export const actions: Actions = {
	update: async (event) => {
		const form = await superValidate(event, zod(studentUpdateSchema));
		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit students', type: 'failure' },
				{ status: 403 }
			);
		}
		if (!form.valid) return fail(404, { form });
		console.log(form.data);

		try {
			await updateStudent(form.data, form.data.advisors);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update student', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Student updated', type: 'success' });
	},
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete students' });
		}
		const { id } = params;
		try {
			await deleteStudent(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete student' });
		}
		return { success: true };
	}
};
