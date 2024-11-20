import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteCourse, fetchCourses } from '$lib/actions/course.actions';

export const load: PageServerLoad = async () => {
	return { courses: await fetchCourses() };
};

export const actions: Actions = {
	delete: async ({ request }) => {
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
		return redirect(302, '/courses');
	}
};
