import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { checkFacultyIdValidity, getFaculties } from '$lib/server/actions/faculty.actions';
import { departmentCreationSchema } from '$lib/schemas/department';
import {
	checkDepartmentAvailability,
	createDepartment
} from '$lib/server/actions/department.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}
	return {
		form: await superValidate(zod(departmentCreationSchema)),
		faculties: await getFaculties()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(departmentCreationSchema));

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

		const name = await checkDepartmentAvailability(form.data.name);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Department name already exists. Please choose another name'
			];
			return fail(400, { form });
		}
		const facultyId = await checkFacultyIdValidity(form.data.facultyId);
		if (!facultyId) {
			form.errors.facultyId = [
				...(form.errors.facultyId ?? ''),
				'Invalid faculty id. Please choose another faculty'
			];
			return fail(400, { form });
		}

		try {
			console.log('Creating department');

			console.log(form.data);

			const departmemt = await createDepartment(form.data.name, form.data.facultyId);
			return message(form, { message: 'Department created', type: 'success', id: departmemt.id });
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create departmemt', type: 'failure' },
				{ status: 400 }
			);
		}
	}
};
