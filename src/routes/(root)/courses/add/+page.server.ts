import { message, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { checkDepartmentIdValidity, getDepartments } from '$lib/server/actions/department.actions';
import { courseCreationSchema } from '$lib/schemas/course';
import {
	checkCourseAvailability,
	createCourse,
	getCourses
} from '$lib/server/actions/courses.actions';
import { addPrerequisites } from '$lib/server/actions/prerequisites.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}
	return {
		form: await superValidate(zod(courseCreationSchema)),
		departments: await getDepartments(),
		courses: await getCourses()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(courseCreationSchema));

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

		const name = await checkCourseAvailability(form.data.name);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Course name already exists. Please choose another name'
			];
			return fail(400, { form });
		}
		const departmentId = await checkDepartmentIdValidity(form.data.departmentId);
		if (!departmentId) {
			form.errors.departmentId = [
				...(form.errors.departmentId ?? ''),
				'Invalid department id. Please choose another department'
			];
			return fail(400, { form });
		}

		try {
			console.log('Creating course');

			console.log(form.data);

			const course = await createCourse(
				form.data.name,
				form.data.code,
				form.data.level,
				form.data.description ?? '',
				form.data.credits,
				form.data.type,
				form.data.prerequisiteCount,
				form.data.departmentId
			);

			const prerequisites = await addPrerequisites(course.id, form.data.prerequisites);

			console.log('Prerequisites added:', prerequisites);

			return message(form, { message: 'Course created', type: 'success', id: course.id });
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to create course', type: 'failure' },
				{ status: 400 }
			);
		}
	}
};
