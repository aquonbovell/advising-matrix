import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		error(401, 'Unauthorized');
	}

	try {
		const faculties = await db.selectFrom('Faculties').select(['id', 'name']).execute();
		return {
			faculties
		};
	} catch (err) {
		console.error(err);
		error(500, 'An error occurred while fetching the faculties');
	}
};
