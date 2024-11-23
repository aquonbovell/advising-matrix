import {
	deleteCourse,
	fetchCourseCodes,
	fetchCourseDetails,
	updateCourse
} from '$lib/actions/course.actions';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { courseUpdateSchema } from './courseUpdate.schema';
import type { Actions, PageServerLoad } from './$types';
import { fetchDepartmentsAll } from '$lib/actions/department.actions';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const course = await fetchCourseDetails(id);
	const form = await superValidate(
		{ ...course, prerequisites: course.prerequisites.map((p) => p.prerequisiteId) },
		zod(courseUpdateSchema)
	);
	const courses = await fetchCourseCodes();
	const departments = await fetchDepartmentsAll();
	return { form, courses, departments };
};

export const actions: Actions = {
	edit: async (event) => {
		if (event.locals.user?.role !== 'ADVISOR') {
			return fail(403, { message: 'You do not have permission to delete courses' });
		}
		const form = await superValidate(event, zod(courseUpdateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			await updateCourse(form.data);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update course' });
		}
		return { success: true };
	},
	delete: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { message: 'You do not have permission to delete courses' });
		}
		const id = (await request.formData()).get('id')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		try {
			await deleteCourse(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete course' });
		}
		return { success: true };
	}
};
