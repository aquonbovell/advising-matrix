import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load = (async ({ locals }) => {
	const data = await db
		.selectFrom('Student')
		.select(['Student.id', 'Student.user_id'])
		.where('Student.user_id', '=', `${locals.user?.id}`)
		.executeTakeFirst();
	if (!data) {
		return {
			student: null
		};
	}
	return {
		student: data
	};
}) satisfies PageServerLoad;
