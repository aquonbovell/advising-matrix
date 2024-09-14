import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');
	const student = await db
		.selectFrom('User')
		.innerJoin('Student', 'User.id', 'Student.user_id')
		.where('User.id', '=', userId)
		.select('Student.id')
		.executeTakeFirst();

	if (!student) error(404, 'Student not found');

	return {
		studentId: student.id
	};
}) satisfies PageServerLoad;
