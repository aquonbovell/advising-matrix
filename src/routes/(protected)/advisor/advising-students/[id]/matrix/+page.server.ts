import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!params.id) error(400, 'Missing student ID');

	const userId = locals.user?.id;
	if (!userId) error(401, 'Unauthorized');

	const student = await db
		.selectFrom('StudentT')
		.select(['major_id', 'minor_id'])
		.where('id', '=', params.id!)
		.executeTakeFirst();

	if (!student) error(404, 'Student not found');

	return {
		program: student
	};
};
