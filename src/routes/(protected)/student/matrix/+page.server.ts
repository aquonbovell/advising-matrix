import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { updateStudentGrades } from '$lib/actions/student.actions';
import type { Grade } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const student = await db
		.selectFrom('User')
		.innerJoin('Student', 'User.id', 'Student.user_id')
		.where('User.id', '=', userId)
		.select(['major_id', 'minor_id', 'Student.id'])
		.executeTakeFirst();

	if (!student) error(404, 'Student not found');

	return {
		student
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
				userId: courseData.userId
			});
		});

		const result = await updateStudentGrades(studentId, data);
		if (result.status === 400) {
			return fail(400, { message: 'Failed to update student courses' });
		}
		return { success: true };
	}
};
