import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const data = await db
		.selectFrom('Student')
		.innerJoin('Advisor', 'Advisor.student_id', 'Student.id')
		.leftJoin('User', 'User.id', 'Advisor.advisor_id')
		.select(['User.email', 'Advisor.advisor_id', 'User.role', 'User.name', 'Student.user_id'])
		.where('Student.user_id', '=', locals.user?.id!)
		.execute();

	if (!data) {
		return {
			advisors: null
		};
	}
	return {
		advisors: data
	};
}) satisfies PageServerLoad;
