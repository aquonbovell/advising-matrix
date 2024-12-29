import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { deleteCourseFromId, getCourseFromId } from '$lib/server/actions/courses.actions';
import {
	deletePrerequisitesFromCourseId,
	getPrerequisiteCoursesFromCourseId
} from '$lib/server/actions/prerequisites.actions';

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

	const prerequisites = await getPrerequisiteCoursesFromCourseId(course.id);
	return { course: { ...course, prerequisites } };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
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

		const deletedPrerequisites = await deletePrerequisitesFromCourseId(id);

		console.log('Prerequisites deleted', deletedPrerequisites);

		if (!deleted) {
			return fail(400, {
				message: 'Error occurred try again'
			});
		}

		return { success: true };
	}
};
