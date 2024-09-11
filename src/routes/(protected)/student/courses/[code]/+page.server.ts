import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	error(500, 'Not implemented');
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
}) satisfies PageServerLoad;
