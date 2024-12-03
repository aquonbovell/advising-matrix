import {
	deleteCourse,
	exist,
	fetchCourseCodes,
	fetchCourseDetails,
	updateCourse
} from '$lib/server/actions/course.actions';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { courseUpdateSchema } from './courseUpdate.schema';
import type { Actions, PageServerLoad } from './$types';
import { fetchDepartmentsAll } from '$lib/server/actions/department.actions';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	try {
		const course = await fetchCourseDetails(id);
		const form = await superValidate(
			{ ...course, prerequisites: course.prerequisites.map((p) => p.prerequisiteId) },
			zod(courseUpdateSchema)
		);
		const courses = await fetchCourseCodes();
		const departments = await fetchDepartmentsAll();
		return { form, courses, departments };
	} catch (err) {
		console.error(err);
		return error(404, { message: 'Not found' });
	}
};

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(courseUpdateSchema));

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

		const courseName = await exist(form.data.name, 'name', form.data.id);
		if (courseName) {
			form.errors.name = [...(form.errors.name ?? ''), 'Course name already exists'];
			return fail(400, { form });
		}
		const courseCode = await exist(form.data.code, 'code', form.data.id);
		if (courseCode) {
			form.errors.code = [...(form.errors.code ?? ''), 'Course code already exists'];
			return fail(400, { form });
		}
		try {
			await updateCourse(form.data);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update course', type: 'failure' },
				{ status: 400 }
			);
		}
		return message(form, { message: 'Course updated', type: 'success' });
	},
	delete: async ({ request, locals, params }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete courses' });
		}
		const { id } = params;
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
