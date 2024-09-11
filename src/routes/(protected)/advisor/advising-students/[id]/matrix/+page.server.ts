import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!params.id) throw error(400, 'Missing student ID');

	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const student = await db
		.selectFrom('StudentT')
		.select('program_id')
		.where('id', '=', params.id!)
		.execute();

	return {
		program: student
	};
};
