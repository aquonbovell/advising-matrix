import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load = (async ({ locals }) => {
	const data = await db
		.selectFrom('Student')
		.leftJoin('Advisor', 'Advisor.id', 'Student.advisor_id')
		.leftJoin('User', 'User.id', 'Advisor.user_id')
		.select(['User.email', 'Advisor.user_id', 'User.role'])
		.where('Student.user_id', '=', `${locals.user?.id}`)
		.executeTakeFirst();
	if (!data) {
		return {
			advisor: null
		};
	}
	return {
		advisor: data
	};
}) satisfies PageServerLoad;
