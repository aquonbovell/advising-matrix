import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	if (!id || id === 'null') {
		return new Response('Student ID is required', { status: 400 });
	}

	const student = await db
		.selectFrom('Student')
		.where('id', '=', id)
		.select(['id'])
		.executeTakeFirst();

	const courses = await db
		.selectFrom('StudentCourses')
		.where('studentId', '=', student?.id!)
		.selectAll()
		.execute();

	const courseIds = courses.map((course) => {
		return { courseId: course.courseId, id: course.id, requirementId: course.requirementId };
	});

	let data = [];

	for (const courseId of courseIds) {
		const grades = courses
			.filter((course) => course.courseId === courseId.courseId)
			.map((course) => course.grade);
		data.push({ ...courseId, grades });
	}

	return json(data);
};
