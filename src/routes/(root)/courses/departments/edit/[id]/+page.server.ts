import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { checkFacultyIdValidity, getFaculties } from '$lib/server/actions/faculty.actions';
import {
	checkDepartmentAvailability,
	deleteDepartmentFromId,
	getDepartmentFromId,
	updateDepartment
} from '$lib/server/actions/department.actions';
import { departmentUpdateSchema } from '$lib/schemas/department';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const departmemt = await getDepartmentFromId(event.params.id);

	if (!departmemt) {
		error(404, 'Department not found');
	}

	const form = await superValidate(zod(departmentUpdateSchema));

	form.data = {
		id: departmemt.id,
		name: departmemt.name,
		facultyId: departmemt.facultyId
	};

	return { form, faculties: await getFaculties() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(departmentUpdateSchema));

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

		const name = await checkDepartmentAvailability(form.data.name, form.data.id);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Department already exists. Please choose another name'
			];
			return fail(400, { form });
		}

		if (form.data.facultyId === null) {
			form.errors.facultyId = [...(form.errors.facultyId ?? ''), 'Please select a faculty'];
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
			console.log('Updating department');

			console.log(form.data);

			await updateDepartment(form.data.id, form.data.name, form.data.facultyId);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update department', type: 'failure' },
				{ status: 400 }
			);
		}
		return redirect(302, `/courses/departments/show/${form.data.id}`);
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
				message: "Enter the department's Id"
			});
		}

		const deleted = await deleteDepartmentFromId(id);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
