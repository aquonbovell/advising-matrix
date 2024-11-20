import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { departmentCreationSchema } from './departmentCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createDepartment } from '$lib/actions/department.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(departmentCreationSchema)),
		faculties: await fetchFaculties()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(departmentCreationSchema));

		if (!form.valid) {
			return fail(404, { form });
		}

		console.log(form.data);
		const departmentName = await db
			.selectFrom('Department')
			.where('name', '=', form.data.name)
			.select(['name'])
			.executeTakeFirst();
		if (departmentName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Department already exists. Please choose another department name'
			];
			return fail(400, { form });
		}

		try {
			const departmentId = await createDepartment(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'An error occurred' });
		}
		return { form };
	}
};
