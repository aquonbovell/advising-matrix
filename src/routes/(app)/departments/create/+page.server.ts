import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { departmentCreationSchema } from './departmentCreation.schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createDepartment, exist } from '$lib/actions/department.actions';
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
		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to create departments', type: 'failure' },
				{ status: 403 }
			);
		}
		if (!form.valid) {
			return fail(404, { form });
		}

		console.log(form.data);
		const departmentName = await exist(form.data.name, 'name');
		if (departmentName) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Department already exists. Please choose another department name'
			];
			return fail(400, { form });
		}

		try {
			await createDepartment(form.data);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to department course', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Department created', type: 'success' });
	}
};
