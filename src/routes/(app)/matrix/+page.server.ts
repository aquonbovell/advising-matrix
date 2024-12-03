import { fetchDegree, fetchStudentCourses } from '$lib/server/actions/matrix.actions';
import {
	fetchStudent,
	fetchStudentByUserId,
	updateStudentGrades
} from '$lib/server/actions/student.actions';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { StudentCourses } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const id = locals.user?.id;
	if (!id) {
		return error(401, 'Unauthorized');
	}
	try {
		const student = await fetchStudentByUserId(id);
		return {
			degree: await fetchDegree(student.id),
			studentCourses: await fetchStudentCourses(student.id),
			student
		};
	} catch (err) {
		console.error(err);
		return error(500, 'Failed to load the matrix');
	}
};
export const actions: Actions = {
	saveGrades: async ({ locals, request }) => {
		if (locals.user?.role !== 'STUDENT') {
			return fail(403, { message: 'You do not have permission to add grades' });
		}
		const formData = await request.formData();

		const suggestions = JSON.parse(formData.get('suggestions')?.toString() ?? '') as Omit<
			StudentCourses,
			'studentId'
		>[];

		const id = formData.get('studentId')?.toString();
		if (!id) {
			return fail(400, { message: 'No id provided' });
		}

		try {
			const student = await updateStudentGrades(id, suggestions);
		} catch (error) {
			console.error(error);
			return fail(500, { message: 'Failed to delete user' });
		}
		return { success: true };
	}
};
