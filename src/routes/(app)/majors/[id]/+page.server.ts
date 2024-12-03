import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { deleteMajor, fetchMajor } from '$lib/server/actions/major.actions';
import { fetchCourseCodes } from '$lib/server/actions/course.actions';
import { fetchFaculties } from '$lib/server/actions/faculty.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	try {
		const major = await fetchMajor(id);

		const courses = await fetchCourseCodes();
		const faculties = await fetchFaculties();
		return { major, courses, faculties };
	} catch (err) {
		console.error(err);
		error(404, { message: 'Not Found' });
	}
};

export const actions: Actions = {
	delete: async ({ params, locals }) => {
		if (locals.user?.role !== 'ADMIN') {
			return fail(403, { message: 'You do not have permission to delete majors' });
		}
		const { id } = params;
		try {
			await deleteMajor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete major' });
		}
		return { success: true };
	}
};
