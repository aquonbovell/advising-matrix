import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { deleteMajor, fetchMajor } from '$lib/actions/major.actions';
import { fetchCourseCodes } from '$lib/actions/course.actions';
import { fetchFaculties } from '$lib/actions/faculty.actions';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const major = await fetchMajor(id);

	const courses = await fetchCourseCodes();
	const faculties = await fetchFaculties();

	if (!major) {
		redirect(303, '/majors');
	}
	return { major, courses, faculties };
};

export const actions: Actions = {
	delete: async ({ params }) => {
		const { id } = params;
		try {
			await deleteMajor(id);
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to delete major' });
		}
		return redirect(302, '/majors');
	}
};
