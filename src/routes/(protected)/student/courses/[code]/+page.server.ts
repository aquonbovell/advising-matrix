import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { trpcServer } from '$lib/server/server';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const courseId = event.params.code;

	const course = await trpcServer.courses.getSpecificCourse.ssr({ code: courseId }, event);

	if (!course) {
		throw error(404, 'Course not found');
	}

	return { course };
};
