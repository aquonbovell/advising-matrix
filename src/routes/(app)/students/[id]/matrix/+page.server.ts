import { fetchDegree, fetchStudentCourses } from '$lib/actions/matrix.actions';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { updateStudentSuggestions } from '$lib/actions/student.actions';
import type { StudentCourses } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	return {
		degree: await fetchDegree(id),
		studentCourses: await fetchStudentCourses(id)
	};
};

export const actions: Actions = {
	saveSuggestions: async ({ params, request }) => {
		const { id } = params;
		const formData = await request.formData();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}
		const suggestions = JSON.parse(formData.get('suggestions')?.toString() ?? '') as Omit<
			StudentCourses,
			'studentId'
		>[];

		console.log(suggestions);

		try {
			const student = await updateStudentSuggestions(id, suggestions);
		} catch (error) {
			console.error(error);
			return fail(500, { message: 'Failed to delete user' });
		}
		return { success: true };
	}
};
