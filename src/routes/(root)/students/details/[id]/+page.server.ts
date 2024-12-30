import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { studentUpdateSchema } from '$lib/schemas/student';
import { getMajors } from '$lib/server/actions/major.actions';
import { getMinors } from '$lib/server/actions/minor.actions';
import { getStudentFromId, updateStudent } from '$lib/server/actions/student.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.role !== 'superadvisor') {
		error(403, 'Forbidden');
	}

	const student = await getStudentFromId(event.params.id);

	if (!student) {
		error(404, 'Student not found');
	}

	const form = await superValidate(zod(studentUpdateSchema));

	form.data = {
		id: student.id,
		userId: student.userId,
		majorId: student.majorId,
		minorId: student.minorId
	};

	return {
		form,
		majors: await getMajors(),
		minors: await getMinors()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(studentUpdateSchema));

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

		if (event.locals.user.role !== 'superadvisor') {
			return message(form, { message: 'Forbidden', type: 'error' }, { status: 403 });
		}

		if (!form.valid) {
			return fail(404, { form });
		}

		if (form.data.majorId === null) {
			form.errors.majorId = [...(form.errors.majorId ?? ''), 'Enter a major Id'];
			return fail(400, { form });
		}
		if (form.data.minorId === null) {
			form.errors.minorId = [...(form.errors.minorId ?? ''), 'Enter a minor Id'];
			return fail(400, { form });
		}

		try {
			console.log('Updating student');

			console.log(form.data);

			const student = await updateStudent(form.data.userId, form.data.majorId, form.data.minorId);
			return message(form, { message: 'Student updated', type: 'success', id: student.userId });
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update student', type: 'failure' },
				{ status: 400 }
			);
		}
	}
};
