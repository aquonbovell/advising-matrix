import { db } from '$lib/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const student = await db
		.selectFrom('User')
		.innerJoin('Student', 'User.id', 'Student.user_id')
		.where('User.id', '=', userId)
		.select(['major_id', 'minor_id'])
		.executeTakeFirst();

	if (!student) error(404, 'Student not found');

	return {
		program: student
	};
};

export const actions: Actions = {};
