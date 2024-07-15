import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	try {
		const advisor = await db
			.selectFrom('Advisor')
			.where('user_id', '=', userId)
			.select(['id'])
			.executeTakeFirst();

		if (!advisor) {
			throw error(404, 'Advisor not found');
		}

		const students = await db
			.selectFrom('Student')
			.where('advisor_id', '=', advisor.id)
			.innerJoin('User', 'User.id', 'Student.user_id')
			.select([
				'Student.id',
				'User.email',
				'Student.created_at',
				'Student.updated_at',
				'Student.invite_token',
				'Student.invite_expires'
			])
			.execute();

		return {
			students
		};
	} catch (err) {
		console.error(err);
		throw error(500, 'An error occurred while fetching the advisor');
	}
};
