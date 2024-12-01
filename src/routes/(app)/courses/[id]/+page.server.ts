import { fail } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { deleteCourse, fetchCourseDetails } from '$lib/actions/course.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const course = await fetchCourseDetails(id);

	return { course };
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
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
