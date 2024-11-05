import { db } from '$lib/db';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchDegree } from '$lib/actions/degree.actions';
import {
	fetchStudentCourses,
	updateStudentGrades,
	updateStudentSuggestions
} from '$lib/actions/student.actions';
import type { Grade } from '$lib/types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!params.id) error(400, 'Missing student ID');

	const userId = locals.user?.id;
	if (!userId) error(401, 'Unauthorized');

	const student = await db
		.selectFrom('Student')
		.select(['major_id', 'minor_id', 'id'])
		.where('id', '=', params.id)
		.executeTakeFirst();

	if (!student) error(404, 'Student not found');
	const degree = await fetchDegree(student.major_id, student.minor_id);

	const studentCourses = await fetchStudentCourses(student.id);

	return {
		student,
		role: locals.user?.role,
		userId,
		degree,
		studentCourses: studentCourses.courses
	};
};

export const actions: Actions = {
	save: async ({ locals, request }) => {
		const userId = locals.user?.id;
		if (!userId) throw error(401, 'Unauthorized');

		const body = await request.formData();

		const studentId = body.get('studentId')?.toString() || '';

		if (!studentId) {
			return fail(400, { message: 'Student ID required' });
		}

		const grades: Record<
			string,
			{
				requirementId: string;
				userId: string;
				grade: Grade[];
			}
		> = JSON.parse(body.get('grades')?.toString() || '{}');

		let data: {
			userId: string;
			courseId: string;
			requirementId: string;
			grades: Grade[];
		}[] = [];

		Object.entries(grades).forEach(([courseId, courseData]) => {
			data.push({
				courseId,
				requirementId: courseData.requirementId,
				grades: courseData.grade,
				userId
			});
		});

		console.log(data);

		const result = await updateStudentSuggestions(studentId, data);
		if (result.status === 400) {
			return fail(400, { message: 'Failed to update student courses' });
		}
		return { success: true };
	}
};
