import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const course = await db
		.selectFrom('Course')
		.where('code', '=', params.code)
		.selectAll()
		.executeTakeFirst();

	const prerequisites = await db
		.selectFrom('CoursePrerequisite')
		.innerJoin('Course', 'CoursePrerequisite.prerequisiteId', 'Course.id')
		.where('CoursePrerequisite.courseId', '=', course?.id?? '')
		.selectAll()
		.execute();

	return { course, prerequisites };
}) satisfies PageServerLoad;
