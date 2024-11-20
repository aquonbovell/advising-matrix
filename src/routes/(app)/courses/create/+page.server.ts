import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createCourse, fetchCourseCodes } from '$lib/actions/course.actions';
import { courseCreationSchema } from './courseCreation.schema';
import { fetchDepartmentsAll } from '$lib/actions/department.actions';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(courseCreationSchema));
	const courses = await fetchCourseCodes();
	const departments = await fetchDepartmentsAll();
	return { form, courses, departments };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(courseCreationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form.data);
		try {
			const id = await createCourse(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update course' });
		}
		return { form };
	}
};
