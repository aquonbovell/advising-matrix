import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { deleteMinor } from '$lib/actions/minor.actions';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';
import { fetchMinor } from '$lib/actions/minor.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const minor = await fetchMinor(id);

	const courses = await fetchCourseCodes();
	const faculties = await fetchFaculties();

	if (!minor) {
		redirect(303, '/minors');
	}
	return { minor, courses, faculties };
};

export const actions: Actions = {
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteMinor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete minor' });
		}
		return redirect(302, '/minors');
	}
};
