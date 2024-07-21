import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load = (async () => {
	const courses = await db
		.selectFrom('Course')
		.orderBy('Course.level asc')
		.orderBy('Course.code asc')
		.selectAll()
		.execute();
	return {
		courses
	};
}) satisfies PageServerLoad;
