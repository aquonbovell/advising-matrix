import { fail } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { deleteCourse, fetchCourseDetails } from '$lib/actions/course.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const course = await fetchCourseDetails(id);

	return { course };
};

export const actions: Actions = {
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteCourse(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete course' });
		}
		return redirect(302, '/courses');
	}
};
