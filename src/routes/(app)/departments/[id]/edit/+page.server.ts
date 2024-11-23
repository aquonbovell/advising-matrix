import { fetchUser, updateUser } from '$lib/actions/user.actions';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	deleteDepartment,
	exist,
	fetchDepartment,
	updateDepartment
} from '$lib/actions/department.actions';
import { departmentUpdateSchema } from './departmentUpdateSchema.schema';
import { fetchFaculties } from '$lib/actions/faculty.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const department = await fetchDepartment(id);
	if (!department) {
		return error(404, { message: 'Department not found' });
	}
	const form = await superValidate({ ...department }, zod(departmentUpdateSchema));
	return { form, faculties: await fetchFaculties() };
};

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(departmentUpdateSchema));

		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit departments', type: 'failure' },
				{ status: 403 }
			);
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const courseName = await exist(form.data.name, 'name');
		if (courseName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Department already exists. Please choose another department name'
			];
			return fail(400, { form });
		}

		try {
			await updateDepartment(form.data);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update department', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Department updated', type: 'success' });
	},
	delete: async ({ params, locals, request }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete departments' });
		}
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteDepartment(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete department' });
		}
		return { success: true };
	}
};
