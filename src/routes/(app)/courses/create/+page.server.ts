import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createCourse, exist, fetchCourseCodes } from '$lib/actions/course.actions';
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
		if (event.locals.user?.role !== 'ADMIN') {
			return message(
				form,
				{ message: 'You do not have permission to edit courses', type: 'failure' },
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
				'Course name already exists. Please choose another course name'
			];
			return fail(400, { form });
		}
		const courseCode = await exist(form.data.code, 'code');
		if (courseCode) {
			form.errors.code = [
				...(form.errors.code ?? ''),
				'Course code already exists. Please choose another course code'
			];
			return fail(400, { form });
		}
		try {
			await createCourse(form.data);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create course', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Course created', type: 'success' });
	}
};
