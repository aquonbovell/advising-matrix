import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { checkDepartmentIdValidity, getDepartments } from '$lib/server/actions/department.actions';
import {
	checkCourseAvailability,
	checkCourseCodeAvailability,
	getCourseFromId,
	getValidCourses
} from '$lib/server/actions/courses.actions';
import { courseUpdateSchema } from '$lib/schemas/course';
import {
	deletePrerequisitesFromCourseId,
	getPrerequisitesFromCourseId,
	updatePrerequisites
} from '$lib/server/actions/prerequisites.actions';
import { deleteCourseFromId } from '$lib/server/actions/courses.actions';
import { updateCourse } from '$lib/server/actions/courses.actions';

export const load = (async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (event.locals.user.role !== 'admin') {
		error(403, 'Forbidden');
	}

	const course = await getCourseFromId(event.params.id);

	if (!course) {
		error(404, 'Course not found');
	}

	const form = await superValidate(zod(courseUpdateSchema));

	const prerequisiteIds = await getPrerequisitesFromCourseId(course.id);

	form.data = {
		id: course.id,
		name: course.name,
		code: course.code,
		credits: course.credits,
		description: course.description,
		level: course.level,
		prerequisiteCount: course.prerequisiteCount,
		type: course.prerequisiteType,
		prerequisites: prerequisiteIds,
		departmentId: course.departmentId
	};

	return {
		form,
		departments: await getDepartments(),
		courses: await getValidCourses(event.params.id)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	edit: async (event) => {
		const form = await superValidate(event, zod(courseUpdateSchema));

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

		const name = await checkCourseAvailability(form.data.name, form.data.id);
		if (!name) {
			form.errors.name = [
				...(form.errors.name ?? ''),
				'Course name already exists. Please choose another name'
			];
			return fail(400, { form });
		}

		const code = await checkCourseCodeAvailability(form.data.code, form.data.id);
		if (!code) {
			form.errors.code = [
				...(form.errors.code ?? ''),
				'Course code already exists. Please choose another code'
			];
			return fail(400, { form });
		}

		if (form.data.departmentId === null) {
			form.errors.departmentId = [
				...(form.errors.departmentId ?? ''),
				'Please select a department'
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
			console.log('Updating course');

			console.log(form.data);

			const course = await updateCourse(
				form.data.id,
				form.data.name,
				form.data.code,
				form.data.level,
				form.data.description ?? '',
				form.data.credits,
				form.data.type,
				form.data.prerequisiteCount,
				form.data.departmentId
			);

			const prerequisites = await updatePrerequisites(course.id, form.data.prerequisites);

			console.log('Prerequisites added:', prerequisites);
		} catch (err) {
			console.error(err);
			return message(
				form,
				{ message: 'Failed to update course', type: 'failure' },
				{ status: 400 }
			);
		}
		return redirect(302, `/courses/show/${form.data.id}`);
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
				message: "Enter the course's Id"
			});
		}

		const deleted = await deleteCourseFromId(id);

		const prerequisitesDeleted = await deletePrerequisitesFromCourseId(id);

		console.log('Prerequisites deleted:', prerequisitesDeleted);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
