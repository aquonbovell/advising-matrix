import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	try {
		const course = await db
			.selectFrom('Course')
			.where('code', '=', params.code)
			.selectAll()
			.executeTakeFirst();
		if (!course) error(404, 'Course not found');

		const prerequisites = await db
			.selectFrom('CoursePrerequisite')
			.innerJoin('Course', 'CoursePrerequisite.prerequisiteId', 'Course.id')
			.where('CoursePrerequisite.courseId', '=', course?.id ?? -1)
			.selectAll()
			.execute();

		return { course, prerequisites };
	} catch (err) {
		console.error(err);
		error(500, 'An error occurred while fetching the course');
	}
}) satisfies PageServerLoad;
