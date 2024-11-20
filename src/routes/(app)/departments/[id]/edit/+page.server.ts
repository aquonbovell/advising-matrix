import { fetchUser, updateUser } from '$lib/actions/user.actions';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	deleteDepartment,
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
	return { form,faculties: await fetchFaculties() };
};

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(departmentUpdateSchema));
		if (!form.valid) return fail(404, { form });
		console.log(form.data);

		const departmentName = await db
			.selectFrom('Faculty')
			.where('name', '=', form.data.name)
			.where('id', '!=', form.data.id)
			.select(['name'])
			.executeTakeFirst();

		if (departmentName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Faculty already exists. Please choose another department name'
			];
			return fail(400, { form });
		}

		try {
			const departmentId = await updateDepartment({ ...form.data });
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	},
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteDepartment(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete department' });
		}
		return redirect(302, '/departments');
	}
};
